import { ISuccessResponse } from '../../interfaces/response.interface';
import { IPaginatedResult } from '../../interfaces/pagination.interface';

/**
 * Crea una respuesta paginada con formato estándar
 */
export function createPaginatedResponse<T>(
  paginatedResult: IPaginatedResult<T>,
  message: string = 'Datos recuperados exitosamente',
): ISuccessResponse<T[]> {
  const { data, pagination } = paginatedResult;

  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}
