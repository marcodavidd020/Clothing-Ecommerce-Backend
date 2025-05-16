import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
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

  /**
   * Obtener todos los productos
   */
  async findAll(): Promise<Product[]> {
    const products: Product[] = await this.productsRepository.findAll([
      'categories',
      'variants',
      'images',
    ]);
    return products.map((product: Product) =>
      this.filterActiveRelations(product),
    );
  }

  /**
   * Obtener productos paginados
   */
  async findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<Product>> {
    const paginatedResult: IPaginatedResult<Product> =
      await this.productsRepository.paginate(options, [
        'categories',
        'variants',
        'images',
      ]);

    const filteredData = paginatedResult.data.map((product: Product) =>
      this.filterActiveRelations(product),
    );

    return { ...paginatedResult, data: filteredData };
  }

  /**
   * Buscar producto por ID
   */
  async findById(id: string): Promise<Product> {
    const productEntity: Product | null =
      await this.productsRepository.findById(id, [
        'categories',
        'variants',
        'images',
      ]);
    if (!productEntity) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    return this.filterActiveRelations(productEntity);
  }

  /**
   * Buscar producto por slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    const productEntity: Product | null =
      await this.productsRepository.findBySlug(slug, [
        'categories',
        'variants',
        'images',
      ]);
    if (!productEntity) {
      return null;
    }
    return this.filterActiveRelations(productEntity);
  }

  /**
   * Crear un nuevo producto
   */
  async create(productData: CreateProductDto): Promise<Product> {
    // Validar que el slug sea único
    const existingProduct = await this.productsRepository.findBySlug(
      productData.slug,
    );
    if (existingProduct) {
      throw new ConflictException({
        message: `Slug ${productData.slug} is already in use`,
        errors: [
          {
            field: 'slug',
            errors: [`El slug ${productData.slug} ya está en uso`],
            value: productData.slug,
          },
        ],
      });
    }

    // Si no se proporcionó un slug, generarlo a partir del nombre
    if (!productData.slug) {
      productData.slug = slugify(productData.name);
    }

    // Crear el producto
    const createdProduct = await this.productsRepository.create(productData);

    // Agregar variantes si se proporcionaron
    if (productData.variants && productData.variants.length > 0) {
      await Promise.all(
        productData.variants.map((variantData) =>
          this.variantsRepository.create({
            ...variantData,
            productId: createdProduct.id,
          }),
        ),
      );
    }

    // Agregar imágenes si se proporcionaron
    if (productData.images && productData.images.length > 0) {
      await Promise.all(
        productData.images.map((imageData) =>
          this.imagesRepository.create({
            ...imageData,
            productId: createdProduct.id,
          }),
        ),
      );
    }

    // Devolver el producto con todas sus relaciones
    return this.findById(createdProduct.id);
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    productData: UpdateProductDto,
  ): Promise<Product | null> {
    // Verificar que el producto existe
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }

    // Validar que el slug sea único si se está actualizando
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const productWithSlug = await this.productsRepository.findBySlug(
        productData.slug,
      );
      if (productWithSlug && productWithSlug.id !== id) {
        throw new ConflictException({
          message: `Slug ${productData.slug} is already in use`,
          errors: [
            {
              field: 'slug',
              errors: [`El slug ${productData.slug} ya está en uso`],
              value: productData.slug,
            },
          ],
        });
      }
    }

    // Actualizar el producto base
    await this.productsRepository.update(id, productData);

    // Manejar variantes
    if (productData.variants) {
      if (productData.replaceVariants) {
        // Eliminar variantes existentes
        await this.variantsRepository.deleteByProductId(id);
      }

      // Agregar nuevas variantes
      if (productData.variants.length > 0) {
        await Promise.all(
          productData.variants.map((variantData) =>
            this.variantsRepository.create({
              ...variantData,
              productId: id,
            }),
          ),
        );
      }
    }

    // Manejar imágenes
    if (productData.images) {
      if (productData.replaceImages) {
        // Eliminar imágenes existentes
        await this.imagesRepository.deleteByProductId(id);
      }

      // Agregar nuevas imágenes
      if (productData.images.length > 0) {
        await Promise.all(
          productData.images.map((imageData) =>
            this.imagesRepository.create({
              ...imageData,
              productId: id,
            }),
          ),
        );
      }
    }

    // Devolver el producto actualizado con todas sus relaciones
    return this.findById(id);
  }

  /**
   * Desactiva un producto y sus variantes e imágenes asociadas (borrado lógico)
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Desactivando producto con ID: ${id} y sus relaciones...`);

    // Desactivar variantes asociadas
    // Es importante hacer esto ANTES de desactivar el producto si hubiera lógica que dependiera del estado activo del producto
    // Pero para una simple desactivación en cascada, el orden es menos crítico que la atomicidad (transacción)
    await this.variantsRepository.deactivateByProductId(id);
    this.logger.log(`Variantes para el producto ${id} desactivadas.`);

    // Desactivar imágenes asociadas
    await this.imagesRepository.deactivateByProductId(id);
    this.logger.log(`Imágenes para el producto ${id} desactivadas.`);

    // Desactivar el producto principal
    const success = await this.productsRepository.deactivateProduct(id);
    if (!success) {
      // Esto podría significar que el producto ya no existía (o no estaba activo para empezar si deactivateProduct verificara eso)
      // O simplemente no se pudo actualizar. La excepción NotFound es apropiada.
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    this.logger.log(`Producto ${id} desactivado exitosamente.`);
  }
}
