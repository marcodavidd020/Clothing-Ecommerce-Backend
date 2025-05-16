import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../../models/carts/entities/cart.entity';
import { CartItem } from '../../../models/carts/entities/cart-item.entity';
import { User } from '../../../models/users/entities/user.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';

@Injectable()
export class CartsSeederService {
  private readonly logger = new Logger(CartsSeederService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Iniciando siembra de carritos...');

    try {
      // Comprobar si ya existen carritos
      const count = await this.cartRepository.count();
      if (count > 0) {
        this.logger.log('Los carritos ya están creados, saltando seeder...');
        return;
      }

      // Encontrar al usuario superadmin
      const superAdminUser = await this.userRepository.findOne({
        where: { email: 'superadmin@example.com' },
      });

      if (!superAdminUser) {
        this.logger.warn(
          'Usuario superadmin no encontrado. No se sembrará un carrito para él.',
        );
        return;
      }

      // Comprobar si el superadmin ya tiene un carrito (doble chequeo por si acaso)
      const superAdminCartExists = await this.cartRepository.findOne({
        where: { user_id: superAdminUser.id },
      });

      if (superAdminCartExists) {
        this.logger.log(
          'El superadmin ya tiene un carrito. Saltando siembra de su carrito.',
        );
        return;
      }

      // Crear un nuevo carrito para el superadmin
      const newCart = this.cartRepository.create({
        user_id: superAdminUser.id,
      });

      // Guardar el carrito primero para obtener su ID
      const savedCart = await this.cartRepository.save(newCart);
      this.logger.log(`Carrito creado para superadmin (ID: ${savedCart.id}).`);

      // Encontrar algunas variantes de producto para añadir como items
      const productVariants = await this.productVariantRepository.find({
        take: 3, // Tomar 3 variantes cualesquiera
      });

      if (productVariants.length === 0) {
        this.logger.warn(
          'No se encontraron variantes de producto para añadir al carrito. El carrito se creará vacío.',
        );
      } else {
        const cartItemsData = productVariants.map((variant) =>
          this.cartItemRepository.create({
            cart_id: savedCart.id,
            product_variant_id: variant.id,
            quantity: Math.floor(Math.random() * 5) + 1, // Cantidad aleatoria entre 1 y 5
          }),
        );

        // Guardar los items del carrito
        await this.cartItemRepository.save(cartItemsData);
        this.logger.log(
          `Añadidos ${cartItemsData.length} items al carrito del superadmin.`,
        );
      }

      this.logger.log('Proceso de siembra de carritos completado.');
    } catch (error) {
      this.logger.error('Error durante la siembra de carritos:', error.stack);
    }
  }
}
