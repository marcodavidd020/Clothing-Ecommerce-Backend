# API de Ecommerce - Documentación

## Introducción

Esta API proporciona todas las funcionalidades necesarias para operar una plataforma de comercio electrónico completa. La API está construida con NestJS y sigue los principios RESTful.

## Características principales

- **Autenticación y autorización**: Sistema completo basado en JWT con roles y permisos
- **Gestión de usuarios**: Registro, autenticación, perfiles, direcciones
- **Catálogo de productos**: Productos, categorías, búsqueda, filtrado
- **Carrito de compras**: Añadir productos, actualizar cantidades, aplicar cupones
- **Gestión de pedidos**: Creación, seguimiento, historial
- **Pagos**: Integración con múltiples pasarelas de pago
- **Administración**: Panel de control para gestionar todos los aspectos de la tienda

## Arquitectura

La API está estructurada siguiendo una arquitectura modular, donde cada dominio de negocio tiene su propio módulo con sus controladores, servicios y entidades correspondientes.

## Flujo de uso típico

1. Un usuario se registra o inicia sesión (endpoints de autenticación)
2. Navega por el catálogo de productos y categorías
3. Añade productos a su carrito
4. Procede al checkout
5. Completa el proceso de pago
6. Recibe confirmación y seguimiento de su pedido

## Consideraciones de seguridad

- Todas las contraseñas se almacenan encriptadas
- La autenticación se realiza mediante tokens JWT
- El acceso a endpoints sensibles está protegido por roles y permisos
- Se implementan medidas contra ataques comunes (CSRF, XSS, etc.)

## Entornos disponibles

- Desarrollo: `http://localhost:3000/api`
- Producción: `https://api.tienda.com`

## Versionado

La API sigue el versionado semántico (SemVer). La versión actual es v1.0.

---

Para cualquier consulta técnica sobre la API, contacte a nuestro equipo de desarrollo.
