# Módulo de Carritos de Compra (Carts)

Este módulo gestiona todas las operaciones relacionadas con los carritos de compra de los usuarios.

## Características

- Creación y gestión de carritos por usuario.
- Añadir, actualizar y eliminar items (variantes de producto) del carrito.
- Cálculo del total del carrito (asumiendo acceso a precios de variantes de producto).
- Persistencia en base de datos usando TypeORM.
- Endpoints protegidos por autenticación JWT.

## Estructura de directorios

```
models/carts/
├── dto/                  # Objetos de transferencia de datos (DTOs)
│   ├── add-cart-item.dto.ts
│   ├── create-cart.dto.ts
│   └── update-cart-item.dto.ts
├── entities/             # Entidades de base de datos (TypeORM)
│   ├── cart.entity.ts
│   └── cart-item.entity.ts
├── interfaces/           # Interfaces y tipos
│   └── cart.interface.ts
├── repositories/         # Repositorios para acceso a datos
│   └── carts.repository.ts
├── serializers/          # Serializers para transformar respuestas
│   ├── cart.serializer.ts
│   └── cart-item.serializer.ts
├── carts.controller.ts   # Controlador REST API
├── carts.module.ts       # Definición del módulo NestJS
└── carts.service.ts      # Lógica de negocio del módulo
```

## Entidades Principales

### `Cart`

- `id`: UUID (Clave Primaria)
- `user_id`: UUID (ForeignKey a `users.id`, Único) - Representa la asociación uno a uno con el usuario.
- `items`: Relación OneToMany con `CartItem`.
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `CartItem`

- `id`: UUID (Clave Primaria)
- `cart_id`: UUID (ForeignKey a `carts.id`)
- `product_variant_id`: UUID (ForeignKey a `product_variants.id`)
- `quantity`: Integer (Cantidad del producto en este item del carrito)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## DTOs (Data Transfer Objects)

- `CreateCartDto`: (`userId`)
- `AddCartItemDto`: (`productVariantId`, `quantity`)
- `UpdateCartItemDto`: (`quantity`)

## Endpoints Principales (Rutas de Usuario)

Todos los endpoints bajo `/carts` requieren autenticación JWT.

| Método   | Ruta                             | Descripción                                      |
|----------|----------------------------------|--------------------------------------------------|
| GET      | `/carts/my-cart`                 | Obtiene/crea el carrito del usuario actual.      |
| POST     | `/carts/my-cart/items`           | Añade un item al carrito del usuario actual.     |
| PUT      | `/carts/my-cart/items/{itemId}`  | Actualiza la cantidad de un item en el carrito.  |
| DELETE   | `/carts/my-cart/items/{itemId}`  | Elimina un item del carrito.                     |
| DELETE   | `/carts/my-cart`                 | Vacía todos los items del carrito del usuario.   |

## Lógica de Negocio (Métodos del Diagrama de Clases)

La lógica para los métodos definidos en el diagrama de clases se implementa principalmente en `CartsService` y `CartsRepository`:

**Clase `Cart` (Lógica en `CartsService` y `CartsRepository`):**
- `clear()`: Implementado como `cartsService.clearCart(cartId)` que llama a `cartsRepository.clearCart(cartId)`.
- `getTotal()`: Implementado en `cartsService.calculateCartTotal(cart)` y usado para poblar el campo `total` en `CartSerializer`.
- `addItem(variantId, quantity)`: Implementado como `cartsService.addItemToCart(cartId, { productVariantId, quantity })`.
- `removeItem(itemId)`: Implementado como `cartsService.removeItemFromCart(cartId, itemId)`.
- `updateItem(itemId, quantity)`: Implementado como `cartsService.updateCartItem(cartId, itemId, { quantity })`.

**Clase `CartItem` (Lógica en `CartsService` y `CartsRepository` para persistencia):**
- `updateQuantity()`: La actualización de cantidad se maneja a través de `cartsService.updateCartItem()`.
- `remove()`: La eliminación de un item se maneja a través de `cartsService.removeItemFromCart()`.

## Dependencias del Módulo

- `UsersModule`: Para validar la existencia de usuarios y asociar carritos.
- `ProductsModule` (o un módulo específico de variantes): Para validar la existencia de `ProductVariant` y obtener información como el precio para calcular el total del carrito. Se asume que este módulo exporta `ProductVariantsRepository` y que `ProductVariant` tiene una propiedad `price`.
- `TypeOrmModule`: Para la interacción con la base de datos.
- `CommonModule` (implícito): Para guards, helpers, etc.

## Consideraciones Adicionales

- **Cálculo de Totales**: El cálculo del total del carrito se realiza en `CartsService` y requiere que las entidades `ProductVariant` (o sus serializadores) tengan una propiedad `price`. El `CartSerializer` incluye un campo `total` que se calcula antes de enviar la respuesta.
- **Gestión de Stock**: La lógica para verificar y actualizar el stock de los productos no está implementada en este módulo de carritos directamente, pero `CartsService` tiene un placeholder donde se podría integrar (al añadir/actualizar items).
- **Autenticación**: Se asume que `JwtAuthGuard` está configurado y que `req.user.id` proporciona el ID del usuario autenticado.
- **Serialización**: Se utiliza `ClassSerializerInterceptor` y serializadores personalizados (`CartSerializer`, `CartItemSerializer`) para controlar la forma de los datos en las respuestas API.
