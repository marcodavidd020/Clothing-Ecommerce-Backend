# Estructura de Modelos y Repositorios

## Organización de la Capa de Modelos

La capa de modelos (`/models`) define las entidades del dominio y la lógica de negocio asociada a ellas.

### Componentes principales:

1. **Entidades**: Clases decoradas con `@Entity()` de TypeORM que representan tablas en la base de datos.
2. **Interfaces**: Definiciones de tipos para crear y actualizar entidades.
3. **Repositorios**: Clases que encapsulan la lógica de acceso a datos.
4. **Serializadores**: Clases para la transformación y formato de respuestas.
5. **Servicios**: Lógica de negocio que opera sobre las entidades.
6. **Controladores**: Endpoints de API para manipular los modelos.

## Patrón de Repositorio Base

Utilizamos un patrón de repositorio base para estandarizar y reutilizar las operaciones CRUD.

```typescript
// Repositorio Base: ModelRepository<Entity, Serializer>
export abstract class ModelRepository<T extends ObjectLiteral, K> {
  // Métodos genéricos: get, getAll, getBy, createEntity, updateEntity, deleteEntity, etc.
}

// Repositorio específico: UsersRepository
export class UsersRepository extends ModelRepository<User, UserSerializer> {
  // Métodos específicos para User
}
```

### Características:

- **Operaciones Genéricas**: CRUD base implementado en la clase ModelRepository
- **Serialización**: Transformación automática de entidades en respuestas
- **Relaciones**: Carga automática de entidades relacionadas
- **Validación**: Verificación de existencia antes de operaciones

## Estructura de una Entidad de Modelo

Cada modelo (por ejemplo, User o Address) se estructura así:

```
models/users/
├── entities/
│   └── user.entity.ts
├── interfaces/
│   └── user.interface.ts
├── repositories/
│   └── users.repository.ts
├── serializers/
│   └── user.serializer.ts
├── users.service.ts
├── users.controller.ts
└── users.module.ts
```

### Flujo de datos:

1. Los requests llegan al controlador
2. El controlador invoca métodos del servicio
3. El servicio usa los repositorios para operaciones de datos
4. El repositorio devuelve entidades serializadas mediante serializadores
5. El servicio aplica lógica de negocio y devuelve los resultados
6. El controlador transforma los resultados en respuestas HTTP 