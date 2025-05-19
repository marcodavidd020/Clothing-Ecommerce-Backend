/**
 * Constantes globales compartidas en toda la aplicación
 */

// Claves para metadatos y almacenamiento
export const USER_TYPES_KEY = 'userTypes';
export const CURRENT_USER_KEY = 'currentUser';

// Configuración de caché
export const CACHE_TTL = 3600; // 1 hora en segundos
export const CACHE_MAX_ITEMS = 100;

// Configuración de paginación
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Mensajes de error estandarizados
export const ERROR_MESSAGES = {
  // Errores de autenticación
  UNAUTHORIZED: 'No autorizado. Por favor, inicie sesión.',
  FORBIDDEN: 'Acceso prohibido. No tiene permisos suficientes.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  TOKEN_EXPIRED: 'Sesión expirada. Por favor, inicie sesión nuevamente.',

  // Errores de recursos
  NOT_FOUND: 'Recurso no encontrado.',
  ALREADY_EXISTS: 'El recurso ya existe.',

  // Errores de validación
  VALIDATION_ERROR: 'Error de validación en los datos proporcionados.',
  INVALID_FORMAT: 'Formato de datos inválido.',

  // Errores de operación
  OPERATION_FAILED: 'La operación no pudo completarse.',
  INTERNAL_ERROR: 'Error interno del servidor.',
  SERVICE_UNAVAILABLE: 'Servicio temporalmente no disponible.',

  // Errores específicos
  EMAIL_IN_USE: 'El correo electrónico ya está en uso.',
  WEAK_PASSWORD: 'La contraseña es demasiado débil.',
  INVALID_TOKEN: 'Token inválido o expirado.',
  INVALID_RESET_TOKEN:
    'El token de restablecimiento es inválido o ha expirado.',
};

// Tipos de usuario
export const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
  CLIENT: 'client',
};

// Roles accesibles por defecto (para uso con @UserTypes decorator)
export const DEFAULT_ACCESS_ROLES = [USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN];

// Configuración de token JWT
export const JWT_CONFIG = {
  SECRET_KEY_ENV: 'JWT_SECRET',
  EXPIRES_IN_ENV: 'JWT_EXPIRES_IN',
  DEFAULT_EXPIRES: '1h',
};
