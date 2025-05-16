import { Permission } from 'src/common/constants/permissions.enum';

export const ProductPermissionsEnum = {
  // Product permissions
  PRODUCT_VIEW: 'products.view',
  PRODUCT_CREATE: 'products.create',
  PRODUCT_UPDATE: 'products.update',
  PRODUCT_DELETE: 'products.delete',

  // Product Variant permissions
  PRODUCT_VARIANT_VIEW: 'product_variants.view',
  PRODUCT_VARIANT_CREATE: 'product_variants.create',
  PRODUCT_VARIANT_UPDATE: 'product_variants.update',
  PRODUCT_VARIANT_DELETE: 'product_variants.delete',

  // Product Image permissions
  PRODUCT_IMAGE_VIEW: 'product_images.view',
  PRODUCT_IMAGE_CREATE: 'product_images.create',
  PRODUCT_IMAGE_UPDATE: 'product_images.update',
  PRODUCT_IMAGE_DELETE: 'product_images.delete',
};

export const ProductPermissions: Record<
  keyof typeof ProductPermissionsEnum,
  Permission
> = {
  PRODUCT_VIEW: {
    name: ProductPermissionsEnum.PRODUCT_VIEW,
    description: 'Ver productos',
  },
  PRODUCT_CREATE: {
    name: ProductPermissionsEnum.PRODUCT_CREATE,
    description: 'Crear productos',
  },
  PRODUCT_UPDATE: {
    name: ProductPermissionsEnum.PRODUCT_UPDATE,
    description: 'Actualizar productos',
  },
  PRODUCT_DELETE: {
    name: ProductPermissionsEnum.PRODUCT_DELETE,
    description: 'Eliminar productos',
  },

  PRODUCT_VARIANT_VIEW: {
    name: ProductPermissionsEnum.PRODUCT_VARIANT_VIEW,
    description: 'Ver variantes de productos',
  },
  PRODUCT_VARIANT_CREATE: {
    name: ProductPermissionsEnum.PRODUCT_VARIANT_CREATE,
    description: 'Crear variantes de productos',
  },
  PRODUCT_VARIANT_UPDATE: {
    name: ProductPermissionsEnum.PRODUCT_VARIANT_UPDATE,
    description: 'Actualizar variantes de productos',
  },
  PRODUCT_VARIANT_DELETE: {
    name: ProductPermissionsEnum.PRODUCT_VARIANT_DELETE,
    description: 'Eliminar variantes de productos',
  },

  PRODUCT_IMAGE_VIEW: {
    name: ProductPermissionsEnum.PRODUCT_IMAGE_VIEW,
    description: 'Ver imágenes de productos',
  },
  PRODUCT_IMAGE_CREATE: {
    name: ProductPermissionsEnum.PRODUCT_IMAGE_CREATE,
    description: 'Crear imágenes de productos',
  },
  PRODUCT_IMAGE_UPDATE: {
    name: ProductPermissionsEnum.PRODUCT_IMAGE_UPDATE,
    description: 'Actualizar imágenes de productos',
  },
  PRODUCT_IMAGE_DELETE: {
    name: ProductPermissionsEnum.PRODUCT_IMAGE_DELETE,
    description: 'Eliminar imágenes de productos',
  },
};
