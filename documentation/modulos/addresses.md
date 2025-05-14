# Módulo de Direcciones

## Descripción

El módulo de Direcciones proporciona funcionalidades para la gestión de direcciones de usuarios, permitiendo almacenar múltiples direcciones por usuario (de envío, facturación, etc.) y marcar una como predeterminada.

## Entidad principal

### Address (Dirección)

La entidad `Address` almacena la información de direcciones físicas asociadas a usuarios.

```typescript
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ nullable: true })
  additionalInfo: string;

  @Column({ default: 'shipping' })
  type: string; // 'shipping', 'billing'

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## DTOs

### CreateAddressDto

```typescript
export class CreateAddressDto {
  @ApiProperty({
    description: 'ID del usuario al que pertenece la dirección',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Nombre de la calle y número',
    example: 'Av. Siempreviva 742',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Springfield',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Estado o provincia',
    example: 'Illinois',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'País',
    example: 'Estados Unidos',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Código postal',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  zipCode: string;

  @ApiProperty({
    description: 'Información adicional (apartamento, piso, etc.)',
    example: 'Apto 3B',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiProperty({
    description: 'Tipo de dirección',
    example: 'shipping',
    enum: ['shipping', 'billing'],
    default: 'shipping',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Indica si es la dirección predeterminada',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
```

### UpdateAddressDto

```typescript
export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  // Hereda todos los campos de CreateAddressDto pero como opcionales
}
```

## Servicios

### AddressesService

El `AddressesService` proporciona métodos para la gestión de direcciones:

- `findAll()`: Obtiene todas las direcciones
- `findById(id)`: Encuentra una dirección por su ID
- `findByUserId(userId)`: Encuentra todas las direcciones de un usuario
- `findDefaultByUserId(userId)`: Obtiene la dirección predeterminada de un usuario
- `create(data)`: Crea una nueva dirección
- `update(id, data)`: Actualiza una dirección existente
- `remove(id)`: Elimina una dirección
- `setDefault(id, userId)`: Marca una dirección como predeterminada

```typescript
// Ejemplo de uso del servicio
const userAddresses = await addressesService.findByUserId(userId);
const defaultAddress = await addressesService.findDefaultByUserId(userId);

await addressesService.setDefault(addressId, userId);
```

## Controlador

### AddressesController

El controlador expone endpoints para la gestión de direcciones:

- `GET /addresses`: Listar todas las direcciones
- `GET /addresses/:id`: Obtener una dirección por ID
- `GET /users/:userId/addresses`: Obtener direcciones de un usuario
- `GET /users/:userId/addresses/default`: Obtener dirección predeterminada
- `POST /addresses`: Crear una nueva dirección
- `PUT /addresses/:id`: Actualizar una dirección existente
- `DELETE /addresses/:id`: Eliminar una dirección
- `PUT /addresses/:id/default`: Establecer una dirección como predeterminada

## Ejemplo de uso en la API

### Crear una dirección

```http
POST /api/addresses
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "street": "Av. Siempreviva 742",
  "city": "Springfield",
  "state": "Illinois",
  "country": "Estados Unidos",
  "zipCode": "12345",
  "additionalInfo": "Casa amarilla",
  "type": "shipping",
  "isDefault": true
}
```

### Establecer como predeterminada

```http
PUT /api/addresses/123e4567-e89b-12d3-a456-426614174000/default
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener direcciones de un usuario

```http
GET /api/users/abcd1234-e89b-12d3-a456-426614174000/addresses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Integración con otros módulos

El módulo de Direcciones se integra principalmente con:

1. **Módulo de Usuarios**: Para asociar direcciones a usuarios
2. **Módulo de Pedidos** (planificado): Para establecer direcciones de envío y facturación

## Consideraciones importantes

- Se implementa validación para evitar que un usuario modifique direcciones de otro usuario
- Solo puede haber una dirección predeterminada por usuario y tipo
- Al establecer una dirección como predeterminada, automáticamente se desmarcan las demás del mismo tipo
- Se recomienda usar transacciones al operar con múltiples direcciones

## Reglas de negocio

- Un usuario puede tener múltiples direcciones
- Existen diferentes tipos de dirección: envío (shipping), facturación (billing)
- Solo puede haber una dirección predeterminada por usuario y por tipo
- El formato de códigos postales y validaciones puede variar según el país
