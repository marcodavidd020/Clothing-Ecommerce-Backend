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

@Injectable()
export class ProductsService implements IProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly variantsRepository: ProductVariantsRepository,
    private readonly imagesRepository: ProductImagesRepository,
  ) {}

  /**
   * Obtener todos los productos
   */
  async findAll(): Promise<ProductSerializer[]> {
    return this.productsRepository.findAll(['categories']);
  }

  /**
   * Obtener productos paginados
   */
  async findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ProductSerializer>> {
    return this.productsRepository.paginate(options, [
      'categories',
      'variants',
      'images',
    ]);
  }

  /**
   * Buscar producto por ID
   */
  async findById(id: string): Promise<ProductSerializer> {
    const product = await this.productsRepository.findById(id, [
      'categories',
      'variants',
      'images',
    ]);
    if (!product) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
    return product;
  }

  /**
   * Buscar producto por slug
   */
  async findBySlug(slug: string): Promise<ProductSerializer | null> {
    return this.productsRepository.findBySlug(slug, [
      'categories',
      'variants',
      'images',
    ]);
  }

  /**
   * Crear un nuevo producto
   */
  async create(productData: CreateProductDto): Promise<ProductSerializer> {
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
  ): Promise<ProductSerializer | null> {
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
   * Eliminar un producto
   */
  async delete(id: string): Promise<void> {
    const success = await this.productsRepository.delete(id);
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Producto'));
    }
  }
}
