import { Exclude, Expose } from 'class-transformer';

/**
 * Serializador para respuestas exitosas
 */
@Exclude()
export class SuccessSerializer<T> {
  @Expose()
  success: boolean = true;

  @Expose()
  message: string;

  @Expose()
  data: T;

  @Expose()
  timestamp: string;

  constructor(partial: Partial<SuccessSerializer<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}
