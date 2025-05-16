import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, DeepPartial } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { CartSerializer } from '../serializers/cart.serializer';
import { User } from '../../users/entities/user.entity';
// Asumimos que existe ProductVariant para validación, aunque la entidad completa no se use aquí directamente.
// import { ProductVariant } from '../../products/entities/product-variant.entity';

@Injectable()
export class CartsRepository extends ModelRepository<Cart, CartSerializer> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(CartSerializer); // Pasamos el serializador base para Cart
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Cart);
    this.metadata = this.repository.metadata;
  }

  private get cartItemRepository() {
    return this.manager.getRepository(CartItem);
  }

  /**
   * Encuentra un carrito por ID de usuario.
   * @param userId ID del usuario.
   * @returns El carrito del usuario o null si no existe.
   */
  async findByUserId(userId: string): Promise<CartSerializer | null> {
    this.manager.connection.logger.log(
      'log',
      `[CartsRepository] (findByUserId) Buscando carrito por user_id: ${userId}`,
    );
    const cart = await this.repository.findOne({
      where: { user_id: userId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    if (cart) {
      const itemCount =
        cart.items && Array.isArray(cart.items)
          ? cart.items.length
          : 'undefined (o no es array)';
      this.manager.connection.logger.log(
        'log',
        `[CartsRepository] (findByUserId) Carrito encontrado para user_id ${userId}. ID: ${cart.id}. Items: ${itemCount}`,
      );
      if (!cart.items) {
        this.manager.connection.logger.log(
          'log',
          `[CartsRepository] (findByUserId) ALERTA: cart.items es ${typeof cart.items} para el carrito ${cart.id}`,
        );
      }
      return new CartSerializer(cart);
    } else {
      this.manager.connection.logger.log(
        'log',
        `[CartsRepository] (findByUserId) No se encontró carrito para user_id: ${userId}`,
      );
      return null;
    }
  }

  /**
   * Encuentra un carrito por su ID.
   * @param cartId ID del carrito.
   * @returns El carrito o null si no existe.
   */
  async findCartById(cartId: string): Promise<CartSerializer | null> {
    this.manager.connection.logger.log(
      'log',
      `[CartsRepository] (findCartById) Buscando carrito por ID: ${cartId}`,
    );
    const cart = await this.repository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    if (cart) {
      const itemCount =
        cart.items && Array.isArray(cart.items)
          ? cart.items.length
          : 'undefined (o no es array)';
      this.manager.connection.logger.log(
        'log',
        `[CartsRepository] (findCartById) Carrito encontrado con ID ${cart.id}. Items: ${itemCount}`,
      );
      if (!cart.items) {
        this.manager.connection.logger.log(
          'log',
          `[CartsRepository] (findCartById) ALERTA: cart.items es ${typeof cart.items} para el carrito ${cart.id}`,
        );
      }
      return new CartSerializer(cart);
    } else {
      this.manager.connection.logger.log(
        'log',
        `[CartsRepository] (findCartById) No se encontró carrito con ID: ${cartId}`,
      );
      return null;
    }
  }

  /**
   * Crea un nuevo carrito para un usuario.
   * @param userId ID del usuario para el que se crea el carrito.
   * @returns El carrito creado.
   */
  async createCart(userId: string): Promise<CartSerializer> {
    this.manager.connection.logger.log(
      'log',
      `[CartsRepository] (createCart) Intentando crear carrito para user_id: ${userId}`,
    );
    const existingCart = await this.repository.findOneBy({ user_id: userId });
    if (existingCart) {
      this.manager.connection.logger.log(
        'log',
        `[CartsRepository] (createCart) Usuario ${userId} ya tiene carrito ID: ${existingCart.id}. Recargando...`,
      );
      const loadedExistingCart = await this.findCartById(existingCart.id);
      if (loadedExistingCart) {
        return loadedExistingCart;
      }
      this.manager.connection.logger.log(
        'warn',
        `[CartsRepository] (createCart) No se pudo recargar el carrito existente ${existingCart.id}.`,
      );
      throw new NotFoundException(
        `No se pudo cargar el carrito existente para el usuario ${userId}.`,
      );
    }

    this.manager.connection.logger.log(
      'log',
      `[CartsRepository] (createCart) Creando nueva entidad de carrito para ${userId}.`,
    );
    const cartEntity = this.repository.create({ user_id: userId, items: [] });
    const savedCart = await this.repository.save(cartEntity);
    this.manager.connection.logger.log(
      'log',
      `[CartsRepository] (createCart) Carrito guardado con ID: ${savedCart.id}. Recargando con relaciones...`,
    );

    const newCartWithRelations = await this.findCartById(savedCart.id);
    if (!newCartWithRelations) {
      this.manager.connection.logger.log(
        'warn',
        `[CartsRepository] (createCart) No se pudo recargar el carrito recién creado ${savedCart.id}.`,
      );
      throw new NotFoundException(
        `No se pudo encontrar el carrito recién creado con ID ${savedCart.id}.`,
      );
    }
    return newCartWithRelations;
  }

  /**
   * Añade un item a un carrito existente o actualiza su cantidad si ya existe.
   * @param cartId ID del carrito.
   * @param productVariantId ID de la variante del producto.
   * @param quantity Cantidad a añadir.
   * @returns El carrito actualizado.
   */
  async addItemToCart(
    cartId: string,
    productVariantId: string,
    quantity: number,
  ): Promise<CartSerializer> {
    const cart = await this.repository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${cartId} no encontrado.`);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart_id: cartId, product_variant_id: productVariantId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cart_id: cartId,
        product_variant_id: productVariantId,
        quantity: quantity,
      });
    }

    if (cartItem.quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCartEntity = await this.repository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });
    if (!updatedCartEntity) {
      throw new NotFoundException(
        `Carrito con ID ${cartId} no encontrado después de la operación de añadir item.`,
      );
    }
    return new CartSerializer(updatedCartEntity);
  }

  /**
   * Actualiza la cantidad de un item específico en el carrito.
   * @param cartId ID del carrito.
   * @param cartItemId ID del item del carrito.
   * @param quantity Nueva cantidad. Si es 0, el item se elimina.
   * @returns El carrito actualizado.
   */
  async updateCartItemQuantity(
    cartId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartSerializer> {
    const cartItem = await this.cartItemRepository.findOneBy({
      id: cartItemId,
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Item del carrito con ID ${cartItemId} no encontrado.`,
      );
    }

    if (cartItem.cart_id !== cartId) {
      throw new NotFoundException(
        `Item ${cartItemId} no pertenece al carrito ${cartId}.`,
      );
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    const updatedCartEntity = await this.repository.findOne({
      where: { id: cartItem.cart_id },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });
    if (!updatedCartEntity) {
      throw new NotFoundException(
        `Carrito con ID ${cartItem.cart_id} no encontrado después de actualizar item ${cartItemId}.`,
      );
    }
    return new CartSerializer(updatedCartEntity);
  }

  /**
   * Elimina un item del carrito.
   * @param cartId ID del carrito (para contexto y recarga).
   * @param cartItemId ID del item a eliminar.
   * @returns El carrito actualizado.
   */
  async removeItemFromCart(
    cartId: string,
    cartItemId: string,
  ): Promise<CartSerializer> {
    const cartItem = await this.cartItemRepository.findOneBy({
      id: cartItemId,
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Item del carrito con ID ${cartItemId} no encontrado.`,
      );
    }

    if (cartItem.cart_id !== cartId) {
      throw new NotFoundException(
        `Item ${cartItemId} no pertenece al carrito ${cartId}.`,
      );
    }

    await this.cartItemRepository.remove(cartItem);

    const updatedCartEntity = await this.repository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });
    if (!updatedCartEntity) {
      throw new NotFoundException(
        `Carrito con ID ${cartId} no encontrado después de eliminar item.`,
      );
    }
    return new CartSerializer(updatedCartEntity);
  }

  /**
   * Vacía todos los items de un carrito.
   * @param cartId ID del carrito a vaciar.
   * @returns El carrito vacío.
   */
  async clearCart(cartId: string): Promise<CartSerializer> {
    const cart = await this.repository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${cartId} no encontrado.`);
    }

    if (cart.items && cart.items.length > 0) {
      const itemIds = cart.items.map((item) => item.id);
      await this.cartItemRepository.delete(itemIds);
    }

    const clearedCartEntity = await this.repository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });
    if (!clearedCartEntity) {
      throw new NotFoundException(
        `Carrito con ID ${cartId} no encontrado después de la operación de vaciado.`,
      );
    }
    return new CartSerializer(clearedCartEntity);
  }

  /**
   * Elimina un carrito por su ID.
   * Esto es una eliminación física, usar con cuidado.
   * @param cartId ID del carrito a eliminar.
   */
  async deleteCart(cartId: string): Promise<void> {
    const result = await this.repository.delete(cartId);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Carrito con ID ${cartId} no encontrado para eliminar.`,
      );
    }
  }
}
