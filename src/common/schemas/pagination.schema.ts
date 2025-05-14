import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Esquema Swagger para respuestas paginadas
 */
export const paginatedResponseSchema = (
  itemSchemaRef: string,
): SchemaObject => ({
  oneOf: [
    {
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Datos recuperados exitosamente',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            $ref: itemSchemaRef,
          },
        },
        pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
    {
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Datos recuperados exitosamente',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            $ref: itemSchemaRef,
          },
        },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  ],
});

/**
 * Parámetros Swagger comunes para paginación
 */
export const paginationQueryParams = [
  {
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  },
  {
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página (por defecto: 10)',
    example: 10,
  },
];

/**
 * Parámetro de búsqueda para Swagger
 */
export const searchQueryParam = {
  name: 'q',
  required: false,
  type: String,
  description: 'Término de búsqueda (buscará en campos relevantes)',
  example: 'marco',
};
