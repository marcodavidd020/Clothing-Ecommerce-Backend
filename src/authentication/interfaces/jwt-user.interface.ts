/**
 * Interfaz para el usuario autenticado en JWT
 */
export interface IJwtUser {
  id: string;
  email: string;
  roles: string[];
}
