/**
 * Interfaces para entradas de datos comunes en la aplicación
 */

/**
 * Interfaz para parámetros de paginación
 */
export interface IPaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interfaz para parámetros de ordenación
 */
export interface ISortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Interfaz para filtros genéricos
 */
export interface IFilterParams {
  [key: string]: any;
}

/**
 * Interfaz para parámetros de búsqueda completos
 */
export interface IQueryParams
  extends IPaginationParams,
    ISortParams,
    IFilterParams {}
