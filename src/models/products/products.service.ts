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
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../common/interfaces/pagination.interface';
import { IProductsService } from './interfaces/product.interface';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { plainToInstance } from 'class-transformer';
import { ApplyDiscountPercentageDto } from './dto/apply-discount-percentage.dto';
import { ApplyFixedDiscountDto } from './dto/apply-fixed-discount.dto';
import { ChangeProductStockDto } from './dto/change-product-stock.dto';
import { DataSource, EntityManager, In } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService implements IProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly dataSource: DataSource,
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
    const paginatedResult: IPaginatedResult<ProductSerializer> =
      await this.productsRepository.paginate(options, [
        'categories',
        'variants',
        'images',
      ]);

    return paginatedResult;
  }

  /**
   * Obtener productos por ID de categoría
   */
  async findProductsByCategoryId(categoryId: string): Promise<ProductSerializer[]> {
    // Podríamos añadir una validación aquí para asegurar que la categoría existe si es necesario,
    // pero el innerJoin en el repositorio ya se encarga de no devolver nada si la categoría no existe o no tiene productos.
    // Tambien podria ser util cargar las categorias para asegurar que el categoryId es valido.
    // const category = await this.dataSource.getRepository(Category).findOneBy({ id: categoryId });
    // if (!category) {
    //   throw new NotFoundException(`Categoría con ID ${categoryId} no encontrada.`);
    // }

    let products: Product[] = await this.productsRepository.findByCategoryId(categoryId, [
      'categories', // Para incluir los detalles de la categoría en cada producto si es necesario
      'variants',
      'images',
    ]);
    products = products.map((product) => this.filterActiveRelations(product));
    return this.transformManyToSerializer(products);
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
    const existingProductBySlug = await this.productsRepository.findRawBySlug(
      productData.slug,
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

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const productRepo = transactionalEntityManager.getRepository(Product);
      const categoryRepo = transactionalEntityManager.getRepository(Category);
      const variantRepo =
        transactionalEntityManager.getRepository(ProductVariant);
      const imageRepo = transactionalEntityManager.getRepository(ProductImage);

      const product = new Product();
      product.name = productData.name;
      product.slug = productData.slug;
      product.description = productData.description ?? null;
      product.price = productData.price;
      product.discountPrice = productData.discountPrice ?? null;
      product.stock = productData.stock ?? 0;
      product.image = productData.image ?? null;
      product.isActive = true;

      if (productData.categoryIds && productData.categoryIds.length > 0) {
        const categories = await categoryRepo.findBy({
          id: In(productData.categoryIds),
        });
        product.categories = categories;
      } else {
        product.categories = [];
      }

      const savedProduct = await productRepo.save(product);

      if (productData.variants && productData.variants.length > 0) {
        const variantsToCreate = productData.variants.map((variantData) => {
          const newVariant = variantRepo.create({
            ...variantData,
            productId: savedProduct.id,
            isActive: true,
          });
          return newVariant;
        });
        await variantRepo.save(variantsToCreate);
      }

      if (productData.images && productData.images.length > 0) {
        const imagesToCreate = productData.images.map((imageData) => {
          const newImage = imageRepo.create({
            ...imageData,
            productId: savedProduct.id,
            isActive: true,
          });
          return newImage;
        });
        await imageRepo.save(imagesToCreate);
      }

      const fullProduct = await productRepo.findOne({
        where: { id: savedProduct.id },
        relations: ['categories', 'variants', 'images'],
      });
      if (!fullProduct) {
        this.logger.error(
          `Producto no encontrado inmediatamente después de crear y dentro de la transacción: ${savedProduct.id}`,
        );
        throw new NotFoundException(
          'Producto no encontrado después de la creación.',
        );
      }
      const filteredProduct = this.filterActiveRelations(fullProduct);
      return this.transformToSerializer(filteredProduct);
    });
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    productData: UpdateProductDto,
  ): Promise<ProductSerializer | null> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const productRepo = transactionalEntityManager.getRepository(Product);
      const categoryRepo = transactionalEntityManager.getRepository(Category);
      const variantRepo =
        transactionalEntityManager.getRepository(ProductVariant);
      const imageRepo = transactionalEntityManager.getRepository(ProductImage);

      let product = await productRepo.findOne({
        where: { id, isActive: true },
        relations: ['categories', 'variants', 'images'],
      });

      if (!product) {
        return null;
      }

      const updatePayload: Partial<Product> = {};
      if (productData.name !== undefined) updatePayload.name = productData.name;
      if (productData.slug !== undefined) updatePayload.slug = productData.slug;
      if (productData.description !== undefined)
        updatePayload.description = productData.description ?? null;
      if (productData.price !== undefined)
        updatePayload.price = productData.price;
      if (productData.discountPrice !== undefined)
        updatePayload.discountPrice = productData.discountPrice ?? null;
      if (productData.stock !== undefined)
        updatePayload.stock = productData.stock ?? 0;
      if (productData.image !== undefined)
        updatePayload.image = productData.image ?? null;
      if (productData.isActive !== undefined)
        updatePayload.isActive = productData.isActive;

      productRepo.merge(product, updatePayload as Product);

      if (productData.categoryIds !== undefined) {
        if (productData.replaceCategories) {
          product.categories = [];
        }
        if (productData.categoryIds.length > 0) {
          const categories = await categoryRepo.findBy({
            id: In(productData.categoryIds),
          });
          if (productData.replaceCategories) {
            product.categories = categories;
          } else {
            const existingCategoryIds = product.categories.map((cat) => cat.id);
            const uniqueNewCategories = categories.filter(
              (cat) => !existingCategoryIds.includes(cat.id),
            );
            product.categories.push(...uniqueNewCategories);
          }
        } else if (productData.replaceCategories) {
          product.categories = [];
        }
      }

      const savedProduct = await productRepo.save(product);

      if (productData.variants) {
        if (productData.replaceVariants) {
          await variantRepo.update(
            { productId: id, isActive: true },
            { isActive: false },
          );
        }
        if (productData.variants.length > 0) {
          const variantsToCreate = productData.variants.map((variantDto) =>
            variantRepo.create({
              ...variantDto,
              productId: id,
              isActive: true,
            }),
          );
          await variantRepo.save(variantsToCreate);
        }
      }

      if (productData.images) {
        if (productData.replaceImages) {
          await imageRepo.update(
            { productId: id, isActive: true },
            { isActive: false },
          );
        }
        if (productData.images.length > 0) {
          const imagesToCreate = productData.images.map((imageDto) =>
            imageRepo.create({
              ...imageDto,
              productId: id,
              isActive: true,
            }),
          );
          await imageRepo.save(imagesToCreate);
        }
      }

      const fullUpdatedProduct = await productRepo.findOne({
        where: { id: savedProduct.id },
        relations: ['categories', 'variants', 'images'],
      });

      if (!fullUpdatedProduct) {
        this.logger.error(
          `Producto no encontrado inmediatamente después de actualizar y dentro de la transacción: ${savedProduct.id}`,
        );
        throw new NotFoundException(
          'Producto no encontrado después de la actualización.',
        );
      }

      const filteredProduct = this.filterActiveRelations(fullUpdatedProduct);
      return this.transformToSerializer(filteredProduct);
    });
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
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }
    const currentStock = product.stock ?? 0;
    product.stock = currentStock + dto.amount;
    if (product.stock < 0) {
      throw new BadRequestException(
        'El stock resultante no puede ser negativo.',
      );
    }
    await this.productsRepository.save(product);
    return this.transformToSerializer(product);
  }

  /**
   * Método interno para modificar el stock de un producto.
   * Utilizado por otros servicios (ej. OrdersService) dentro de una transacción.
   * @param productId ID del producto
   * @param quantityChange Cantidad a sumar (positivo) o restar (negativo) al stock
   * @param manager EntityManager opcional para la transacción
   */
  async changeStockInternal(
    productId: string,
    quantityChange: number,
    manager?: EntityManager,
  ): Promise<Product> {
    let product: Product | null;

    if (manager) {
      const repo = manager.getRepository(Product);
      product = await repo.findOneBy({ id: productId });
    } else {
      product = await this.productsRepository.findEntityById(productId);
    }

    if (!product) {
      this.logger.error(
        `Producto con ID ${productId} no encontrado durante cambio de stock interno.`,
      );
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado.`,
      );
    }

    const newStock = (product.stock ?? 0) + quantityChange;
    if (newStock < 0) {
      this.logger.error(
        `Stock insuficiente para producto ${productId}. Solicitado: ${quantityChange}, Actual: ${product.stock}`,
      );
      throw new ConflictException(
        `Stock insuficiente para el producto ${product.name}. Stock actual: ${product.stock}, se intentó reducir en ${Math.abs(quantityChange)}.`,
      );
    }
    product.stock = newStock;

    if (manager) {
      const repo = manager.getRepository(Product);
      return repo.save(product);
    } else {
      return this.productsRepository.save(product);
    }
  }
}
