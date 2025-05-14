import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ModelSerializer {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial?: Partial<any>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

/**
 * Función auxiliar para convertir objetos de entidad a serializadores
 * Esta función ayuda a evitar problemas de tipo al usar serializadores con helpers genéricos
 */
export function serializeModels<T extends ModelSerializer>(
  entities: any[],
  SerializerClass: new (entity: any) => T,
): T[] {
  return entities.map((entity) => new SerializerClass(entity));
}

/**
 * Función auxiliar para convertir un objeto de entidad a un serializador
 */
export function serializeModel<T extends ModelSerializer>(
  entity: any,
  SerializerClass: new (entity: any) => T,
): T {
  return new SerializerClass(entity);
}
