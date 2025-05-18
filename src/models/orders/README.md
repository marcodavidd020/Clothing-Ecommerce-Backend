# Módulo de Órdenes (Orders)

Este módulo gestiona todas las operaciones relacionadas con las órdenes o pedidos de los clientes.

## Características

- Creación y seguimiento de órdenes por usuario.
- Asociación de items de orden (variantes de producto) con precios y cantidades específicas al momento de la compra.
- Cálculo del monto total de la orden, considerando precios de items, descuentos de producto y cupones de descuento aplicados a la orden.
- Integración con módulos de Usuarios, Direcciones, Productos (Variantes), Cupones y Pagos.
- Persistencia en base de datos usando TypeORM.
- Endpoints protegidos por autenticación JWT y sistema de permisos.
- Manejo de estados de la orden y estados de pago.

## Estructura de directorios

```
models/orders/
├── constants/            # Constantes y Enums (OrderStatusEnum, OrderPermissionsEnum)
│   ├── order.enums.ts
│   └── order-permissions.ts
├── dto/                  # Objetos de transferencia de datos (DTOs)
│   ├── create-order.dto.ts
│   ├── create-order-item.dto.ts
│   └── update-order.dto.ts
├── entities/             # Entidades de base de datos (TypeORM)
│   ├── order.entity.ts
│   └── order-item.entity.ts
├── interfaces/           # Interfaces y tipos TypeScript
│   ├── order.interface.ts
│   └── order-item.interface.ts
├── repositories/         # Repositorios para acceso a datos
│   └── orders.repository.ts
├── serializers/          # Serializers para transformar respuestas HTTP
│   ├── order.serializer.ts
│   └── order-item.serializer.ts
├── orders.controller.ts  # Controlador REST API
├── orders.module.ts      # Definición del módulo NestJS
└── orders.service.ts     # Lógica de negocio del módulo
```

## Entidades Principales

### `Order`

- `id`: UUID (Clave Primaria)
- `user_id`: UUID (ForeignKey a `users.id`)
- `address_id`: UUID (ForeignKey a `addresses.id`)
- `payment_id`: UUID (ForeignKey a `payments.id`, Opcional)
- `coupon_id`: UUID (ForeignKey a `coupons.id`, Opcional)
- `totalAmount`: Decimal (Monto total de la orden después de descuentos e impuestos si aplicaran)
- `status`: Enum (Estado actual de la orden, ej. PENDING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `paymentStatus`: Enum (Estado del pago asociado, ej. PENDING, PAID, FAILED)
- `paymentMethod`: Enum (Método de pago elegido, ej. CARD, QR)
- `items`: Relación OneToMany con `OrderItem`.
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `OrderItem`

- `id`: UUID (Clave Primaria)
- `order_id`: UUID (ForeignKey a `orders.id`)
- `product_variant_id`: UUID (ForeignKey a `product_variants.id`)
- `quantity`: Integer (Cantidad del producto en este item)
- `price`: Decimal (Precio unitario del producto *en el momento de la compra*, incluyendo descuentos de producto si aplicaron en ese instante)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## DTOs Principales

- `CreateOrderDto`: (`address_id`, `payment_method`, `items: CreateOrderItemDto[]`, `coupon_code?`, `user_id?` (opcional para admin))
- `CreateOrderItemDto`: (`product_variant_id`, `quantity`)
- `UpdateOrderDto`: (`status?`, `paymentStatus?`, `payment_transaction_id?`)

## Endpoints Principales

Todos los endpoints bajo `/orders` requieren autenticación JWT y permisos adecuados.

**Rutas de Usuario:**

| Método | Ruta                       | Descripción                                      |
|--------|----------------------------|--------------------------------------------------|
| POST   | `/orders`                  | Realizar una nueva orden (Place order).          |
| GET    | `/orders/my-orders`        | Obtener historial de órdenes del usuario actual. |
| GET    | `/orders/my-orders/{id}`   | Obtener detalles de una orden específica.        |
| PATCH  | `/orders/{id}/cancel-my-order` | Cancelar una orden propia (si el estado lo permite).|

**Rutas de Administrador (ejemplos):**

| Método | Ruta                  | Descripción                                      |
|--------|-----------------------|--------------------------------------------------|
| GET    | `/orders`             | Obtener todas las órdenes (con paginación).      |
| GET    | `/orders/{id}`        | Obtener detalles de cualquier orden por ID.      |
| PATCH  | `/orders/{id}/status` | Actualizar el estado de una orden.               |

## Lógica de Negocio (Métodos del Diagrama de Clases en `OrdersService`)

- `placeOrder()`: (`createOrderDto`, `userId`)
  - Valida usuario, dirección, items (stock, existencia de variantes).
  - Calcula el precio de cada item (considerando el precio del producto/variante en ese momento).
  - Calcula el `totalAmount` inicial.
  - Valida y aplica cupón si se proporciona, recalculando `totalAmount`.
  - Crea la entidad `Order` y sus `OrderItem` asociados.
  - Gestiona la reducción de stock de las variantes de producto.
  - Crea un registro de `Payment` asociado con estado PENDIENTE.
  - Devuelve la orden creada.
  - **Importante**: Todo este proceso debe ser transaccional.
- `cancelOrder()`: (`orderId`, `userId?`)
  - Valida si la orden puede ser cancelada según su estado actual.
  - Cambia el estado de la orden a `CANCELLED`.
  - Si hubo un pago, cambia el `paymentStatus` a `REFUNDED` o `CANCELLED` y podría interactuar con `PaymentsService` para procesar un reembolso/cancelación de pago.
  - Restaura el stock de los `OrderItem`s.
  - Si se aplicó un cupón, podría revertir su uso en `UserCoupon` (si es de un solo uso por usuario y se marcó).
  - **Importante**: Todo este proceso debe ser transaccional.
- `getOrderSummary()`: Implementado a través de `findOrderById()` que devuelve `OrderSerializer` con toda la información relevante.
- `updateOrderStatus()`: (`orderId`, `newStatus`, `paymentTransactionId?`)
  - Actualiza el estado de la orden.
  - Si el nuevo estado es `PROCESSING` y el pago no estaba `PAID`, intenta confirmar el pago usando `paymentTransactionId` (si se provee) a través de `PaymentsService`.
  - Puede incluir lógica de notificación al usuario.

## Consideraciones Adicionales

- **Transacciones**: Las operaciones críticas como `placeOrder` y `cancelOrder` deben ejecutarse dentro de transacciones de base de datos para asegurar la consistencia de los datos (ej. creación de orden, actualización de stock, creación de pago, uso de cupón).
- **Cálculo de Precios y Totales**: El precio de `OrderItem` se fija en el momento de la compra. El `totalAmount` de la `Order` se calcula sumando subtotales de items y aplicando descuentos de cupón.
- **Gestión de Stock**: El stock se descuenta al realizar la orden y se restaura si la orden se cancela (y los items son retornables).
- **Pagos**: El módulo de órdenes interactúa con el módulo de Pagos para registrar y actualizar el estado de los pagos. La lógica de procesamiento real del pago (ej. comunicación con Stripe) reside en `PaymentsService`.
- **Notificaciones**: Se podrían integrar notificaciones por email o push en diferentes etapas del ciclo de vida de la orden (confirmación, envío, entrega). 