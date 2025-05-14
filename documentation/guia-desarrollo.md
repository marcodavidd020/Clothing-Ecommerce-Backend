# Guía para desarrolladores

## Configuración del entorno de desarrollo

### Requisitos previos

- Node.js (versión >= 20)
- NPM (versión >= 9)
- PostgreSQL (versión >= 14)

### Configuración inicial

1. Clonar el repositorio:

```bash
git clone git@github.com:tu-usuario/NestJS-Template.git
cd NestJS-Template
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus configuraciones locales:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=ecommerce
```

5. Ejecutar migraciones:

```bash
npm run migration:run
```

6. Cargar datos de prueba:

```bash
npm run seed
```

7. Iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

## Flujo de trabajo de desarrollo

### Estructura de ramas

- `main`: Código estable, listo para producción
- `dev`: Rama de desarrollo principal
- `feature/nombre-de-característica`: Ramas para nuevas características
- `bugfix/nombre-del-bug`: Ramas para corrección de errores

### Creación de nuevos endpoints

1. Crear una entidad en la carpeta correspondiente:

```typescript
// src/models/productos/entities/producto.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;
}
```

2. Crear un DTO:

```typescript
// src/models/productos/dto/create-producto.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Smartphone XYZ',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example:
      'Smartphone de última generación con 8GB RAM y 128GB almacenamiento',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 599.99,
  })
  @IsNotEmpty()
  @IsNumber()
  precio: number;
}
```

3. Crear un repositorio:

```typescript
// src/models/productos/repositories/productos.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';

@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find();
  }

  async findById(id: string): Promise<Producto> {
    return this.productosRepository.findOne({ where: { id } });
  }

  async create(productoData: Partial<Producto>): Promise<Producto> {
    const producto = this.productosRepository.create(productoData);
    return this.productosRepository.save(producto);
  }
}
```

4. Crear un servicio:

```typescript
// src/models/productos/productos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductosRepository } from './repositories/productos.repository';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.findAll();
  }

  async findById(id: string): Promise<Producto> {
    const producto = await this.productosRepository.findById(id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(productoData: CreateProductoDto): Promise<Producto> {
    return this.productosRepository.create(productoData);
  }
}
```

5. Crear un controlador:

```typescript
// src/models/productos/productos.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    type: Producto,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Producto[]> {
    return this.productosService.findAll();
  }

  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Producto,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Producto> {
    return this.productosService.findById(id);
  }

  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado',
    type: Producto,
  })
  @Post()
  async create(@Body() productoData: CreateProductoDto): Promise<Producto> {
    return this.productosService.create(productoData);
  }
}
```

6. Crear un módulo:

```typescript
// src/models/productos/productos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosRepository } from './repositories/productos.repository';
import { Producto } from './entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductosController],
  providers: [ProductosService, ProductosRepository],
  exports: [ProductosService],
})
export class ProductosModule {}
```

## Pruebas

### Pruebas unitarias

Ejecutar todas las pruebas unitarias:

```bash
npm run test
```

Ejecutar pruebas con watch mode:

```bash
npm run test:watch
```

### Pruebas e2e

```bash
npm run test:e2e
```

## Despliegue

### Preparación para producción

1. Compilar el proyecto:

```bash
npm run build
```

2. El código compilado estará disponible en la carpeta `dist/`.

### Variables de entorno en producción

Asegurarse de configurar las siguientes variables de entorno en producción:

```
NODE_ENV=production
PORT=3000
DATABASE_HOST=...
DATABASE_PORT=...
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_NAME=...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
```

### Comando de inicio en producción

```bash
npm run start:prod
```
