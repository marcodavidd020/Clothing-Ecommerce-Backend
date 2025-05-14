import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationErrorSerializer } from '../serializers/validation/validation-error.serializer';
import { FieldError } from '../serializers/responses/error.serializer';

/**
 * Pipe para validación personalizada
 *
 * Extiende la funcionalidad del ValidationPipe estándar de NestJS
 * para proporcionar mensajes de error más detallados y consistentes
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Si no hay tipo de datos o es un valor primitivo, no validar
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    // Transformar valor plano a instancia de clase
    const object = plainToClass(metadata.metatype, value);

    // Validar el objeto
    const errors = await validate(object);

    // Si hay errores, lanzar excepción con formato personalizado
    if (errors.length > 0) {
      // Formatear errores para mejor legibilidad
      const formattedErrors: FieldError[] = errors.map((err) => {
        const constraints = err.constraints
          ? Object.values(err.constraints)
          : ['Error de validación'];

        return {
          field: err.property,
          errors: constraints,
          value: err.value,
        };
      });

      // Lanzar excepción con formato personalizado
      throw new BadRequestException(
        new ValidationErrorSerializer({
          message: 'Error de validación en los datos proporcionados',
          errors: formattedErrors,
        }),
      );
    }

    return object;
  }

  // Verifica si un metatype debe ser validado
  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
