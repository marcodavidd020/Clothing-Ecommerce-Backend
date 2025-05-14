# Arquitectura del API de Ecommerce

## Visión general

Esta API está construida con NestJS, un framework progresivo de Node.js para construir aplicaciones server-side eficientes, confiables y escalables. La arquitectura sigue los principios de Domain-Driven Design (DDD) y Clean Architecture, separando la lógica de negocio de los detalles de infraestructura.

## Índice de Documentación de Arquitectura

La documentación detallada de la arquitectura está organizada en los siguientes documentos:

1. **[Estructura General](arquitectura/estructura-general.md)**: Organización de capas y estructura de archivos
2. **[Estructura de Modelos](arquitectura/estructura-modelos.md)**: Organización de entidades, repositorios y servicios
3. **[Configuración del Sistema](arquitectura/configuracion-sistema.md)**: Gestión de configuraciones y variables de entorno
4. **[Estructura de Base de Datos](arquitectura/database-estructura.md)**: Organización de la capa de datos
5. **[Migraciones de Base de Datos](arquitectura/database-migraciones.md)**: Gestión y automatización de migraciones
6. **[Estructura de Proveedores](arquitectura/providers-estructura.md)**: Conexiones a servicios externos

## Principios arquitectónicos

La arquitectura del sistema se basa en los siguientes principios:

- **Separación de Responsabilidades**: Cada componente tiene una única responsabilidad
- **Independencia de Frameworks**: La lógica de negocio no depende de frameworks externos
- **Testabilidad**: Diseño orientado a facilitar pruebas automatizadas
- **Mantenibilidad**: Código organizado y documentado para facilitar su mantenimiento
- **Escalabilidad**: Estructura modular que permite el crecimiento del sistema



## Patrones utilizados

- **Dependency Injection**: Utilizado extensivamente a través de NestJS
- **Repository Pattern**: Para aislar operaciones de base de datos
- **DTO Pattern**: Para transferir datos entre capas
- **Decorator Pattern**: Para añadir funcionalidades a clases y métodos
- **Middleware Pattern**: Para procesar solicitudes antes de llegar a los controladores
- **Interceptor Pattern**: Para manipular respuestas antes de ser enviadas al cliente
