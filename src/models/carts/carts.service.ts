import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CartsRepository } from './repositories/carts.repository';
import { CartSerializer } from './serializers/cart.serializer';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UsersRepository } from '../users/repositories/users.repository'; // Para validar existencia de usuario
import { ProductVariantsRepository } from '../products/repositories/product-variants.repository'; // Para validar existencia de variante y obtener precio
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { ProductVariant } from '../products/entities/product-variant.entity'; // Asegurar que está importado para la interfaz local

// Interfaz local para abordar el problema de 'price' en ProductVariant - ELIMINADA
// interface ProductVariantWithPrice extends ProductVariant {
//   price?: number;
// }

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);

  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
  ) {}

  /**
   * Obtiene o crea un carrito para un usuario específico.
   * @param userId ID del usuario.
   * @returns El carrito del usuario serializado.
   */
  async findOrCreateCartByUserId(userId: string): Promise<CartSerializer> {
    try {
      this.logger.log(`Buscando usuario con ID: ${userId}`);
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        this.logger.warn(
          `Intento de obtener carrito para usuario no existente: ${userId}`,
        );
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
      }

      this.logger.log(`Buscando carrito para usuario: ${userId}`);
      let cart = await this.cartsRepository.findByUserId(userId);

      if (!cart) {
        this.logger.log(
          `No se encontró carrito para el usuario ${userId}. Creando uno nuevo.`,
        );
        try {
          cart = await this.cartsRepository.createCart(userId);
          this.logger.log(`Carrito creado con éxito para usuario ${userId}`);
        } catch (error) {
          this.logger.error(
            `Error al crear carrito: ${error.message}`,
            error.stack,
          );
          throw new NotFoundException(
            `No se pudo crear el carrito para el usuario ${userId}: ${error.message}`,
          );
        }

        if (!cart) {
          this.logger.error(`Carrito creado es nulo para usuario ${userId}`);
          throw new NotFoundException(
            `No se pudo crear el carrito para el usuario ${userId}.`,
          );
        }
      }

      this.logger.log(
        `Calculando total y serializando carrito para usuario ${userId}`,
      );
      try {
        return this.calculateTotalAndSerialize(cart);
      } catch (error) {
        this.logger.error(
          `Error al calcular total y serializar: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Error en findOrCreateCartByUserId: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Obtiene un carrito por su ID.
   * @param cartId ID del carrito.
   * @returns El carrito serializado.
   */
  async findCartById(cartId: string): Promise<CartSerializer> {
    const cart = await this.cartsRepository.findCartById(cartId);
    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${cartId} no encontrado.`);
    }
    return this.calculateTotalAndSerialize(cart);
  }

  /**
   * (Opcional) Crea explícitamente un carrito si se quiere separar la lógica de findOrCreate.
   * Usualmente findOrCreateCartByUserId es suficiente.
   */
  async createCartForUser(
    createCartDto: CreateCartDto,
  ): Promise<CartSerializer> {
    const { userId } = createCartDto;
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    const existingCart = await this.cartsRepository.findByUserId(userId);
    if (existingCart) {
      throw new ConflictException(
        `El usuario ${userId} ya tiene un carrito. ID: ${existingCart.id}`,
      );
    }

    const newCart = await this.cartsRepository.createCart(userId);
    if (!newCart) {
      throw new NotFoundException(
        `No se pudo crear el carrito para el usuario ${userId}.`,
      );
    }
    return this.calculateTotalAndSerialize(newCart);
  }

  /**
   * Añade un item al carrito de un usuario. (addItem del diagrama de clases)
   * @param cartId ID del carrito.
   * @param addCartItemDto DTO con productVariantId y quantity.
   * @returns El carrito actualizado serializado.
   */
  async addItemToCart(
    cartId: string,
    addCartItemDto: AddCartItemDto,
  ): Promise<CartSerializer> {
    const { productVariantId, quantity } = addCartItemDto;

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que cero.');
    }

    const cartExists = await this.cartsRepository.findCartById(cartId);
    if (!cartExists) {
      throw new NotFoundException(`Carrito con ID ${cartId} no encontrado.`);
    }

    // Usar findRawById para obtener la entidad ProductVariant directamente
    const productVariant: ProductVariant | null =
      await this.productVariantsRepository.findRawById(productVariantId);
    if (!productVariant) {
      throw new NotFoundException(
        `Variante de producto con ID ${productVariantId} no encontrada.`,
      );
    }

    // Verificar stock (si es necesario aquí, o delegar al repositorio)
    if (productVariant.stock < quantity) {
      throw new ConflictException(
        `Stock insuficiente para la variante ${productVariant.product.name}. Disponible: ${productVariant.stock}`,
      );
    }

    const updatedCart = await this.cartsRepository.addItemToCart(
      cartId,
      productVariantId,
      quantity,
    );
    return this.calculateTotalAndSerialize(updatedCart);
  }

  /**
   * Actualiza la cantidad de un item en el carrito. (updateItem del diagrama de clases)
   * Si la cantidad es 0, el item se elimina.
   * @param cartId ID del carrito.
   * @param itemId ID del CartItem.
   * @param updateCartItemDto DTO con la nueva cantidad.
   * @returns El carrito actualizado serializado.
   */
  async updateCartItem(
    cartId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartSerializer> {
    const { quantity } = updateCartItemDto;

    if (quantity < 0) {
      throw new BadRequestException('La cantidad no puede ser negativa.');
    }

    const updatedCart = await this.cartsRepository.updateCartItemQuantity(
      cartId,
      itemId,
      quantity,
    );
    return this.calculateTotalAndSerialize(updatedCart);
  }

  /**
   * Elimina un item del carrito. (removeItem del diagrama de clases)
   * @param cartId ID del carrito.
   * @param itemId ID del CartItem a eliminar.
   * @returns El carrito actualizado serializado.
   */
  async removeItemFromCart(
    cartId: string,
    itemId: string,
  ): Promise<CartSerializer> {
    const updatedCart = await this.cartsRepository.removeItemFromCart(
      cartId,
      itemId,
    );
    return this.calculateTotalAndSerialize(updatedCart);
  }

  /**
   * Vacía todos los items de un carrito. (clear del diagrama de clases)
   * @param cartId ID del carrito.
   * @returns El carrito vacío serializado.
   */
  async clearCart(cartId: string): Promise<CartSerializer> {
    const clearedCart = await this.cartsRepository.clearCart(cartId);
    return this.calculateTotalAndSerialize(clearedCart);
  }

  /**
   * Calcula el precio total del carrito.
   * @param cart Entidad Cart con sus items y productVariants cargados.
   * @returns El número representando el total.
   */
  private async calculateCartTotal(cart: Cart): Promise<number> {
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }

    // Usar reduce para acumular el total
    const total = cart.items.reduce((accumulator, item) => {
      // Asegurarse de que item, productVariant y product están cargados
      if (!item.productVariant || !item.productVariant.product) {
        this.logger.warn(
          `[CartsService] calculateCartTotal (reduce): No se pudo cargar productVariant o product para item ${item.id} en carrito ${cart.id}. Skipping.`, // Mensaje más claro
        );
        return accumulator; // Si no se carga, no suma nada y mantiene el acumulador
      }

      const productEntity = item.productVariant.product;
      let priceToUse = 0;

      // Convertir precios de string (si vienen así de decimal) a number y verificar si son números válidos >= 0
      const regularPrice = Number(productEntity.price);
      const discountPrice = Number(productEntity.discountPrice);

      // Priorizar discountPrice si es un número válido y >= 0
      if (!isNaN(discountPrice) && discountPrice >= 0) {
        priceToUse = discountPrice;
      } else if (!isNaN(regularPrice) && regularPrice >= 0) {
        // Usar regularPrice si es válido y >= 0
        priceToUse = regularPrice;
      } else {
        this.logger.warn(
          `[CartsService] calculateCartTotal (reduce): Precio inválido o no encontrado para product ${productEntity.id} (variant ${item.product_variant_id}). RegPrice: ${productEntity.price}, DiscPrice: ${productEntity.discountPrice}.`, // Detalles para depurar
        );
        return accumulator; // Si no hay precio válido, no suma nada
      }

      // Sumar al acumulador
      return accumulator + item.quantity * priceToUse;
    }, 0); // Iniciar el acumulador en 0

    return total;
  }

  /**
   * Helper para calcular el total y luego serializar el carrito.
   * @param cart Entidad Cart (puede ser Cart o CartSerializer de una operación previa).
   * @returns CartSerializer con el total calculado.
   */
  private async calculateTotalAndSerialize(
    cartInput: Cart | CartSerializer,
  ): Promise<CartSerializer> {
    try {
      if (!cartInput) {
        // Esto podría ocurrir si un método del repositorio devolviera null y no se manejara antes.
        // Sin embargo, los flujos actuales en el servicio intentan asegurar que cartInput no es null aquí.
        this.logger.error(
          'calculateTotalAndSerialize fue llamado con un input nulo.',
        );
        throw new NotFoundException(
          'No se pudo procesar el carrito porque no se encontró o es inválido.',
        );
      }

      let cartEntity: Cart;
      if (!(cartInput instanceof Cart)) {
        try {
          // Si es CartSerializer, obtenemos la entidad Cart completa para asegurar todas las relaciones.
          const foundCart = await this.cartsRepository.findRawById(
            cartInput.id,
            ['items', 'items.productVariant', 'items.productVariant.product'],
          );
          if (!foundCart) {
            this.logger.error(
              `No se pudo encontrar el carrito con ID ${cartInput.id} para calcular su total.`,
            );
            throw new NotFoundException(
              `Carrito con ID ${cartInput.id} no encontrado al calcular total.`,
            );
          }
          cartEntity = foundCart;
        } catch (error) {
          this.logger.error(
            `Error al obtener el carrito completo: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      } else {
        cartEntity = cartInput;
      }

      try {
        // Calcular el total del carrito
        const total = await this.calculateCartTotal(cartEntity);
        // Convertir a CartSerializer y añadir el total
        return new CartSerializer(cartEntity, total);
      } catch (error) {
        this.logger.error(
          `Error al calcular total del carrito ${cartEntity.id}: ${error.message}`,
          error.stack,
        );
        // Si hay un error en el cálculo, retornamos con total 0 para evitar que falle toda la operación
        return new CartSerializer(cartEntity, 0);
      }
    } catch (error) {
      this.logger.error(
        `Error en calculateTotalAndSerialize: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Elimina un carrito por completo. Usar con precaución.
   * @param cartId ID del carrito a eliminar.
   */
  async deleteCart(cartId: string): Promise<void> {
    const cart = await this.cartsRepository.findCartById(cartId);
    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${cartId} no encontrado.`);
    }
    await this.cartsRepository.deleteCart(cartId);
    this.logger.log(`Carrito con ID ${cartId} eliminado exitosamente.`);
  }
}
