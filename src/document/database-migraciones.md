# Generación Automática de Migraciones

Este proyecto está configurado para generar migraciones de base de datos automáticamente a partir de los cambios en las entidades.

## Proceso de migración

1. **Modificar entidades**: Actualiza o crea nuevas entidades en la carpeta `src/models/*/entities/`.
2. **Generar migración**: Ejecuta el comando de generación automática.
3. **Revisar migración**: Verifica que la migración generada sea correcta.
4. **Ejecutar migración**: Aplica los cambios a la base de datos.

## Comandos para migraciones

```bash
# Generar una migración automáticamente a partir de los cambios en las entidades
npm run migration:generate

# Crear una migración vacía (para escribir manualmente)
npm run migration:create

# Ejecutar las migraciones pendientes
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert
```

## Ejemplo de flujo de trabajo

1. Modificar una entidad (por ejemplo, agregar un campo `phoneNumber` a `User`):

```typescript
@Entity('users')
export class User {
  // ... campos existentes

  @Column({ length: 20, nullable: true })
  phoneNumber: string;
  
  // ... resto de la entidad
}
```

2. Generar una migración automática:

```bash
npm run migration:generate
```

Esto generará un archivo en `src/database/migrations/` con un timestamp (por ejemplo, `1592951122243-auto.ts`), que contendrá algo como:

```typescript
export class Auto1592951122243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'phoneNumber',
      type: 'varchar',
      length: '20',
      isNullable: true
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phoneNumber');
  }
}
```

3. Ejecutar la migración:

```bash
npm run migration:run
```

## Consideraciones importantes

- **No usar `synchronize: true` en producción**: Aunque es conveniente durante el desarrollo, puede causar pérdida de datos en producción.
- **Revisar migraciones antes de aplicarlas**: Las migraciones automáticas pueden no ser perfectas en todos los casos.
- **Migraciones con relaciones**: Cuando se trabaja con relaciones, a veces es mejor escribir migraciones manualmente.
- **Orden de ejecución**: Las migraciones se ejecutan en orden de timestamp, asegúrate de que sea coherente con las dependencias entre tablas. 