// Exportación de entidades
export { User } from './users/entities/user.entity';
export { UsersModule } from './users/users.module';
export { UsersRepository } from './users/repositories/users.repository';
export { UserSerializer } from './users/serializers/user.serializer';
export { UsersService } from './users/users.service';

// Addresses Exports
export { Address } from './addresses/entities/address.entity';
export { AddressesModule } from './addresses/addresses.module';
export { AddressesRepository } from './addresses/repositories/addresses.repository';
export { AddressesService } from './addresses/addresses.service';
export { AddressSerializer } from './addresses/serializers/address.serializer';
// Fin Addresses Exports

// Roles Exports
export { Role } from './roles/entities/role.entity';
export { RolesRepository } from './roles/repositories/roles.repository';
export { RolesModule } from './roles/roles.module';
export { RolesService } from './roles/roles.service';
export { RoleSerializer } from './roles/serializers/role.serializer';
// Fin Roles Exports

// Permissions Exports
export { Permission } from './permissions/entities/permission.entity';
export { PermissionsRepository } from './permissions/repositories/permissions.repository';
export { PermissionsModule } from './permissions/permissions.module';
export { PermissionsService } from './permissions/permissions.service';
export { PermissionSerializer } from './permissions/serializers/permission.serializer';
// Fin Permissions Exports

// Categories Exports
export { Category } from './categories/entities/category.entity';
export { CategoriesRepository } from './categories/repositories/categories.repository';
export { CategoriesModule } from './categories/categories.module';
export { CategoriesService } from './categories/categories.service';
export { CategorySerializer } from './categories/serializers/category.serializer';
// Fin Categories Exports

// Products Exports
export { Product } from './products/entities/product.entity';
export { ProductsRepository } from './products/repositories/products.repository';
export { ProductsModule } from './products/products.module';
export { ProductsService } from './products/products.service';
export { ProductSerializer } from './products/serializers/product.serializer';
// Fin Products Exports

// Carts Exports
export { Cart } from './carts/entities/cart.entity';
export { CartsRepository } from './carts/repositories/carts.repository';
export { CartsModule } from './carts/carts.module';
export { CartsService } from './carts/carts.service';
export { CartSerializer } from './carts/serializers/cart.serializer';
// Fin Carts Exports

// Coupons Exports
export { Coupon } from './coupons/entities/coupon.entity';
export { CouponsRepository } from './coupons/repositories/coupons.repository';
export { CouponsModule } from './coupons/coupons.module';
export { CouponsService } from './coupons/coupons.service';
export { CouponSerializer } from './coupons/serializers/coupon.serializer';
// Fin Coupons Exports

// User Coupons Exports
export { UserCoupon } from './user-coupons/entities/user-coupon.entity';
export { UserCouponsRepository } from './user-coupons/repositories/user-coupons.repository';
export { UserCouponsModule } from './user-coupons/user-coupons.module';
export { UserCouponsService } from './user-coupons/user-coupons.service';
export { UserCouponSerializer } from './user-coupons/serializers/user-coupon.serializer';
// Fin User Coupons Exports

// Payments Exports
export { Payment } from './payments/entities/payment.entity';
export { PaymentsRepository } from './payments/repositories/payments.repository';
export { PaymentsModule } from './payments/payments.module';
export { PaymentsService } from './payments/payments.service';
export { PaymentSerializer } from './payments/serializers/payment.serializer';
// Fin Payments Exports

// Orders Exports
export { Order } from './orders/entities/order.entity';
export { OrderItem } from './orders/entities/order-item.entity';
export { OrdersRepository } from './orders/repositories/orders.repository';
export { OrdersModule } from './orders/orders.module';
export { OrdersService } from './orders/orders.service';
export { OrderSerializer } from './orders/serializers/order.serializer';
export { OrderItemSerializer } from './orders/serializers/order-item.serializer';
// Fin Orders Exports

// Reviews Exports
export { Review } from './reviews/entities/review.entity';
export { ReviewsRepository } from './reviews/repositories/reviews.repository';
export { ReviewsModule } from './reviews/reviews.module';
export { ReviewsService } from './reviews/reviews.service';
export { ReviewSerializer } from './reviews/serializers/review.serializer';
// Fin Reviews Exports

// Models
export { ModelsModule } from './models.module';
