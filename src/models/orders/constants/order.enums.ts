export enum OrderStatusEnum {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // Esperando pago
  PROCESSING = 'PROCESSING', // Pago recibido, pedido en preparación
  SHIPPED = 'SHIPPED', // Pedido enviado
  DELIVERED = 'DELIVERED', // Pedido entregado
  CANCELLED = 'CANCELLED', // Pedido cancelado
  FAILED = 'FAILED', // Pedido fallido (ej. error en pago no recuperable)
  COMPLETED = 'COMPLETED', // Pedido completado y entregado satisfactoriamente
  REFUNDED = 'REFUNDED', // Pedido reembolsado
}

// Nota: PaymentStatusEnum y PaymentMethodEnum se importarán desde el módulo de pagos cuando sea necesario.
// src/models/payments/constants/payment.enums.ts
