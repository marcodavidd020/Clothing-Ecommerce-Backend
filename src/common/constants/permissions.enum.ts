import { ClientPermissions } from 'src/authentication/constants/auth-permissions';
import { AddressPermissions } from 'src/models/addresses/constants/addres-permissions';
import { CartPermissions } from 'src/models/carts/constants/cart-permissions';
import { CategoryPermissions } from 'src/models/categories/constants/categorie-permissions';
import { CouponPermissions } from 'src/models/coupons/constants/coupon-permissions';
import { OrderPermissions } from 'src/models/orders/constants/order-permissions';
import { PaymentPermissions } from 'src/models/payments/constants/payment-permissions';
import { PermissionPermissions } from 'src/models/permissions/constants/permission-permissions';
import { ProductPermissions } from 'src/models/products/constants/product-permissions.constant';
import { ReviewPermissions } from 'src/models/reviews/constants/review-permissions';
import { RolePermissions } from 'src/models/roles/constants/role-permissions';
import { UserCouponPermissions } from 'src/models/user-coupons/constants/user-coupon-permissions';
import { UserPermissions } from 'src/models/users/constants/user-permissions';

/**
 * Interfaz para definir permisos con descripción
 */
export interface Permission {
  name: string;
  description: string;
}

/**
 * Todos los permisos en un solo objeto para facilitar importaciones
 */
export const ALL_PERMISSIONS = {
  USER: UserPermissions,
  ROLE: RolePermissions,
  PERMISSION: PermissionPermissions,
  CLIENT: ClientPermissions,
  ADDRESS: AddressPermissions,
  CATEGORY: CategoryPermissions,
  PRODUCT: ProductPermissions,
  CART: CartPermissions,
  PAYMENT: PaymentPermissions,
  COUPON: CouponPermissions,
  USER_COUPON: UserCouponPermissions,
  ORDER: OrderPermissions,
  REVIEW: ReviewPermissions,
};

/**
 * Lista plana de todos los permisos con sus descripciones para seeders
 */
export const PERMISSIONS_LIST: Permission[] = [
  ...Object.values(UserPermissions),
  ...Object.values(RolePermissions),
  ...Object.values(PermissionPermissions),
  ...Object.values(ClientPermissions),
  ...Object.values(AddressPermissions),
  ...Object.values(CategoryPermissions),
  ...Object.values(ProductPermissions),
  ...Object.values(CartPermissions),
  ...Object.values(PaymentPermissions),
  ...Object.values(CouponPermissions),
  ...Object.values(UserCouponPermissions),
  ...Object.values(OrderPermissions),
  ...Object.values(ReviewPermissions),
];
