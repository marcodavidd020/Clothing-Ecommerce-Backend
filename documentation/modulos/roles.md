# Módulo de Roles y Permisos

## Descripción

El módulo de Roles y Permisos implementa un sistema RBAC (Role-Based Access Control) completo que permite la gestión granular de permisos en la aplicación. Este sistema permite asignar roles a usuarios y definir qué acciones pueden realizar dentro de la aplicación.

## Entidades principales

### Role (Rol)

La entidad `Role` representa un conjunto de permisos que puede ser asignado a uno o más usuarios.

```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Permission (Permiso)

La entidad `Permission` representa una acción específica que puede ser realizada en el sistema.

```typescript
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### RolePermission (Relación Rol-Permiso)

Esta entidad representa la relación muchos-a-muchos entre roles y permisos.

```typescript
@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn()
  role_id: string;

  @PrimaryColumn()
  permission_id: string;
}
```

### UserRole (Relación Usuario-Rol)

Esta entidad asocia usuarios con roles y permite determinar qué roles tiene asignados cada usuario.

```typescript
@Entity('user_roles')
export class UserRole {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  role_id: string;
}
```

## Servicios

### RolesService

El `RolesService` proporciona métodos para la gestión de roles:

- Creación, actualización y eliminación de roles
- Asignación y revocación de permisos a roles
- Consulta de roles con sus permisos asociados

```typescript
// Ejemplo de uso del servicio
const adminRole = await rolesService.findByName('admin');
await rolesService.assignPermissionsToRole(adminRole.id, permissionIds);
```

### PermissionsService

El `PermissionsService` gestiona los permisos disponibles en el sistema:

- Creación, actualización y eliminación de permisos
- Consulta de permisos por nombre o ID
- Verificación de permisos para un rol o usuario

```typescript
// Ejemplo de verificación de permiso
const hasPermission = await permissionsService.userHasPermission(
  userId,
  'users.create',
);
```

## Controladores

### RolesController

Expone endpoints para la gestión de roles:

- `GET /roles`: Listar todos los roles
- `GET /roles/:id`: Obtener un rol por ID
- `POST /roles`: Crear un nuevo rol
- `PUT /roles/:id`: Actualizar un rol existente
- `DELETE /roles/:id`: Eliminar un rol
- `POST /roles/:id/permissions`: Asignar permisos a un rol
- `DELETE /roles/:id/permissions/:permissionId`: Revocar un permiso de un rol

### PermissionsController

Proporciona endpoints para la gestión de permisos:

- `GET /permissions`: Listar todos los permisos
- `GET /permissions/:id`: Obtener un permiso por ID
- `POST /permissions`: Crear un nuevo permiso
- `PUT /permissions/:id`: Actualizar un permiso existente
- `DELETE /permissions/:id`: Eliminar un permiso

## Implementación del Control de Acceso

El sistema implementa el control de acceso mediante guardias y decoradores personalizados:

### PermissionsGuard

Verifica si un usuario tiene los permisos necesarios para acceder a un endpoint.

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Implementación para verificar permisos
  }
}
```

### RequirePermissions Decorator

Decorador para especificar qué permisos son necesarios para acceder a un endpoint:

```typescript
// Uso del decorador en un controlador
@Post()
@RequirePermissions('users.create')
async createUser(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

## Seeders

El módulo incluye seeders para inicializar roles y permisos predeterminados:

- `RolesSeeder`: Crea roles básicos (superadmin, admin, user)
- `PermissionsSeeder`: Crea permisos básicos para cada módulo
- `RolePermissionsSeeder`: Asigna permisos iniciales a los roles
- `UserRolesSeeder`: Asigna roles iniciales a usuarios predefinidos

## Integración con otros módulos

El módulo se integra con:

1. **Módulo de Usuarios**: Para asignar roles a usuarios
2. **Módulo de Autenticación**: Para verificar permisos durante la autorización

## Ejemplo de uso

```typescript
// En un controlador
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.view')
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions('users.create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```
