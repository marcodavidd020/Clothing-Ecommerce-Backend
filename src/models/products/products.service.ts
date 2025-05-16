import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductImagesRepository } from './repositories/product-images.repository';
import { ProductSerializer } from './serializers/product.serializer';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import { slugify } from 'src/common/helpers/string.helper';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../common/interfaces/pagination.interface';
import { IProductsService } from './interfaces/product.interface';
import { Product } from './entities/product.entity';
import { plainToInstance } from 'class-transformer';
import { ApplyDiscountPercentageDto } from './dto/apply-discount-percentage.dto';
import { ApplyFixedDiscountDto } from './dto/apply-fixed-discount.dto';
import { ChangeProductStockDto } from './dto/change-product-stock.dto';

@Injectable()
export class ProductsService implements IProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly variantsRepository: ProductVariantsRepository,
    private readonly imagesRepository: ProductImagesRepository,
  ) {}

  private filterActiveRelations(product: Product): Product {
    if (product) {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants = product.variants.filter(
          (variant) => variant.isActive === true,
        );
      }
      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.filter(
          (image) => image.isActive === true,
        );
      }
    }
    return product;
  }

  private transformToSerializer(product: Product): ProductSerializer {
    return plainToInstance(ProductSerializer, product, {
      excludeExtraneousValues: true,
    });
  }

  private transformManyToSerializer(products: Product[]): ProductSerializer[] {
    return products.map((product) => this.transformToSerializer(product));
  }

  /**
   * Obtener todos los productos
   */
  async findAll(): Promise<ProductSerializer[]> {
    let products: Product[] = await this.productsRepository.findAll([
      'categories',
      'variants',
      'images',
    ]);
    products = products.map((product) => this.filterActiveRelations(product));
    return this.transformManyToSerializer(products);
  }

  /**
   * Obtener productos paginados
   */
  async findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ProductSerializer>> {
    const paginatedResult: IPaginatedResult<Product> =
      await this.productsRepository.paginate(options, [
        'categories',
        'variants',
        'images',
      ]);

    const filteredData = paginatedResult.data.map((product) =>
      this.filterActiveRelations(product),
    );

    const serializedData = this.transformManyToSerializer(filteredData);

    return { ...paginatedResult, data: serializedData };
  }

  /**
   * Buscar producto por ID
   */
  async findById(id: string): Promise<ProductSerializer> {
    let productEntity: Product | null = await this.productsRepository.findById(
      id,
      ['categories', 'variants', 'images'],
    );
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    productEntity = this.filterActiveRelations(productEntity);
    return this.transformToSerializer(productEntity);
  }

  /**
   * Buscar producto por slug
   */
  async findBySlug(slug: string): Promise<ProductSerializer | null> {
    let productEntity: Product | null =
      await this.productsRepository.findBySlug(slug, [
        'categories',
        'variants',
        'images',
      ]);
    if (!productEntity) {
      return null;
    }
    productEntity = this.filterActiveRelations(productEntity);
    return this.transformToSerializer(productEntity);
  }

  /**
   * Crear un nuevo producto
   */
  async create(productData: CreateProductDto): Promise<ProductSerializer> {
    // Primero, verificar si el slug ya existe
    const existingProductBySlug = await this.productsRepository.findBySlug(
      productData.slug,
      // true, // Opcional: incluir desactivados.
      // El método findBySlug actual del repo no toma este segundo argumento directamente.
      // Para buscar incluyendo inactivos, se debería modificar findBySlug en el repositorio
      // o crear un método específico para ello. Por ahora, busca solo activos.
      // Si `ProductsRepository.findBySlug` se modifica para aceptar `includeInactive=true`,
      // y queremos esa lógica, se debe pasar `true` aquí.
    );
    if (existingProductBySlug) {
      throw new ConflictException({
        message: `Slug ${productData.slug} is already in use`,
        errors: [
          {
            message: `Slug ${productData.slug} is already in use`,
            field: 'slug',
            errors: [`El slug ${productData.slug} ya está en uso`],
            value: productData.slug,
          },
        ],
        statusCode: 409,
      });
    }

    // Si el slug no existe, proceder a crear el producto
    const createdProductEntity =
      await this.productsRepository.create(productData);

    // Manejar variantes y imágenes aquí si es necesario, o asegurar que el findById las cargue
    // (ProductsRepository.create no carga relaciones de variantes/imágenes por sí mismo)
    if (productData.variants && productData.variants.length > 0) {
      await Promise.all(
        productData.variants.map((variantData) =>
          this.variantsRepository.create({
            ...variantData,
            productId: createdProductEntity.id,
          }),
        ),
      );
    }
    if (productData.images && productData.images.length > 0) {
      await Promise.all(
        productData.images.map((imageData) =>
          this.imagesRepository.create({
            ...imageData,
            productId: createdProductEntity.id,
          }),
        ),
      );
    }

    // Volver a buscar para obtener todas las relaciones y aplicar filtros/serialización
    // Esto asegura que las variantes/imágenes recién creadas se incluyan en la respuesta.
    return this.findById(createdProductEntity.id);
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    productData: UpdateProductDto,
  ): Promise<ProductSerializer | null> {
    const updatedProductEntity = await this.productsRepository.update(
      id,
      productData,
    );
    if (!updatedProductEntity) {
      return null;
    }

    // Manejar variantes e imágenes
    if (productData.variants) {
      if (productData.replaceVariants) {
        await this.variantsRepository.deactivateByProductId(id); // Usar desactivación lógica
      }
      await Promise.all(
        productData.variants.map((variantData) =>
          this.variantsRepository.create({
            ...variantData,
            productId: id,
          }),
        ),
      );
    }
    if (productData.images) {
      if (productData.replaceImages) {
        await this.imagesRepository.deactivateByProductId(id); // Usar desactivación lógica
      }
      await Promise.all(
        productData.images.map((imageData) =>
          this.imagesRepository.create({
            ...imageData,
            productId: id,
          }),
        ),
      );
    }

    // Volver a buscar para obtener el estado completo, aplicar filtros y serializar
    return this.findById(id);
  }

  /**
   * Eliminar (desactivar) un producto
   */
  async delete(id: string): Promise<void> {
    // Primero, desactivar el producto principal
    const success = await this.productsRepository.deactivateProduct(id);
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }

    // Luego, desactivar sus variantes e imágenes asociadas
    // (Asumiendo que los repositorios de variantes e imágenes tienen un método deactivateByProductId)
    await this.variantsRepository.deactivateByProductId(id);
    await this.imagesRepository.deactivateByProductId(id);

    this.logger.log(
      `Producto con ID ${id} y sus relaciones asociadas desactivados.`,
    );
  }

  // Nuevos métodos de servicio
  async applyDiscountPercentage(
    productId: string,
    dto: ApplyDiscountPercentageDto,
  ): Promise<ProductSerializer> {
    const productEntity = await this.productsRepository.findById(productId);
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }

    try {
      productEntity.applyDiscountPercentage(dto.percentage);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedProduct = await this.productsRepository.save(productEntity);
    return this.transformToSerializer(savedProduct);
  }

  async applyFixedDiscount(
    productId: string,
    dto: ApplyFixedDiscountDto,
  ): Promise<ProductSerializer> {
    const productEntity = await this.productsRepository.findById(productId);
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    try {
      productEntity.applyFixedDiscount(dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedProduct = await this.productsRepository.save(productEntity);
    return this.transformToSerializer(savedProduct);
  }

  async removeDiscount(productId: string): Promise<ProductSerializer> {
    const productEntity = await this.productsRepository.findById(productId);
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    productEntity.removeDiscount();
    const savedProduct = await this.productsRepository.save(productEntity);
    return this.transformToSerializer(savedProduct);
  }

  async changeStock(
    productId: string,
    dto: ChangeProductStockDto,
  ): Promise<ProductSerializer> {
    const productEntity = await this.productsRepository.findById(productId);
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    try {
      productEntity.changeStock(dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedProduct = await this.productsRepository.save(productEntity);
    return this.transformToSerializer(savedProduct);
  }
}
