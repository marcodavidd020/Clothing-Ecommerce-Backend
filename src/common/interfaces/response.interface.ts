/**
 * Interfaz para respuestas exitosas estandarizadas
 */
export interface ISuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}

/**
 * Interfaz para respuestas de error estandarizadas
 */
export interface IErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors?: any[];
  timestamp: string;
}
