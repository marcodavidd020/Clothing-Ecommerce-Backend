# Flujos Comunes en la API de Ecommerce

Esta guía documenta los flujos de trabajo más comunes que se pueden implementar con nuestra API de ecommerce.

## 1. Registro y autenticación de un cliente

1. El cliente se registra en la plataforma:

   ```
   POST /auth/register
   {
     "email": "cliente@ejemplo.com",
     "firstName": "Juan",
     "lastName": "Pérez",
     "password": "contraseña123"
   }
   ```

2. El sistema devuelve los datos del usuario creado.

3. El cliente inicia sesión:

   ```
   POST /auth/login
   {
     "email": "cliente@ejemplo.com",
     "password": "contraseña123"
   }
   ```

4. El sistema devuelve un token JWT:

   ```
   {
     "accessToken": "eyJhbGciOiJIUzI1...",
     "refreshToken": "eyJhbGciOiJIUzI1...",
     "expiresIn": 3600,
     "tokenType": "Bearer"
   }
   ```

5. Para todas las peticiones posteriores, el cliente debe incluir el token en la cabecera:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1...
   ```

## 2. Agregar productos al carrito

1. Buscar productos por categoría o términos de búsqueda:

   ```
   GET /products?category=electronics&page=1&limit=10
   ```

2. Agregar un producto al carrito:

   ```
   POST /cart/items
   {
     "productId": "123",
     "quantity": 2,
     "attributes": {
       "color": "black",
       "size": "M"
     }
   }
   ```

3. Ver el contenido del carrito:

   ```
   GET /cart
   ```

4. Actualizar la cantidad de un producto:
   ```
   PATCH /cart/items/456
   {
     "quantity": 3
   }
   ```

## 3. Proceso de checkout

1. Iniciar el proceso de checkout:

   ```
   POST /checkout/start
   ```

2. Agregar dirección de envío:

   ```
   POST /checkout/shipping-address
   {
     "street": "Calle Principal 123",
     "city": "Madrid",
     "zipCode": "28001",
     "country": "España"
   }
   ```

3. Seleccionar método de envío:

   ```
   POST /checkout/shipping-method
   {
     "methodId": "standard"
   }
   ```

4. Agregar información de pago:

   ```
   POST /checkout/payment
   {
     "method": "credit_card",
     "cardNumber": "4111111111111111",
     "expiryMonth": "12",
     "expiryYear": "2025",
     "cvv": "123"
   }
   ```

5. Revisar pedido:

   ```
   GET /checkout/review
   ```

6. Confirmar pedido:
   ```
   POST /checkout/confirm
   ```

## 4. Seguimiento de pedidos

1. Listar pedidos del cliente:

   ```
   GET /orders
   ```

2. Ver detalles de un pedido específico:

   ```
   GET /orders/123
   ```

3. Cancelar un pedido (si está permitido):
   ```
   POST /orders/123/cancel
   {
     "reason": "He encontrado una mejor oferta"
   }
   ```

## 5. Gestión de devoluciones

1. Solicitar una devolución:

   ```
   POST /orders/123/returns
   {
     "items": [
       {
         "orderItemId": "456",
         "quantity": 1,
         "reason": "Producto defectuoso"
       }
     ]
   }
   ```

2. Ver estado de la devolución:
   ```
   GET /returns/789
   ```

Estos son los flujos más comunes en nuestra API de ecommerce. Para más detalles sobre endpoints específicos, consulta la documentación respectiva de cada módulo.
