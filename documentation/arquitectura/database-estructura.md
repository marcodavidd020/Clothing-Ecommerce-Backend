# Estructura de Base de Datos

El proyecto organiza los aspectos relacionados con bases de datos en tres capas diferentes:

## 1. /config/database

Contiene la configuración para conectarse a diferentes sistemas de base de datos:

- Postgres
- MySQL
- MongoDB

Cada carpeta contiene:

- `config.module.ts`: Módulo de configuración
- `config.service.ts`: Servicio que proporciona valores de configuración
- `configuration.ts`: Valores de configuración por defecto

Esta capa SOLO maneja configuración, no conexiones.

## 2. /providers/database

Implementa los proveedores que crean conexiones a las bases de datos:

- Postgres
- MySQL
- MongoDB

Cada proveedor:

- Usa la configuración de la capa `/config/database`
- Encapsula la lógica de conexión con su sistema respectivo
- Puede proporcionar clientes específicos del sistema

Esta capa maneja conexiones y servicios específicos.

## 3. /database

Contiene la estructura para migraciones y datos iniciales:

- Migraciones: Definición del esquema de la base de datos
- Factories: Generadores de datos para pruebas
- Seeders: Pobladores de datos iniciales

Esta capa gestiona la evolución del esquema y los datos.

## Relación entre las capas

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ /config/    │    │ /providers/  │    │ /database   │
│ database    │───▶│ database     │───▶│             │
└─────────────┘    └─────────────┘    └─────────────┘
  Configuración      Conexiones        Migraciones y
                                       Datos iniciales
```

- `/config/database` proporciona configuración a `/providers/database`
- `/providers/database` proporciona conexiones a `/database`
- `/database` usa estas conexiones para migraciones y seeders
