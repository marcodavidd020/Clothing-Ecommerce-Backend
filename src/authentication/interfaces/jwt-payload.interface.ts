export interface IJwtPayload {
  sub: string;
  email: string;
  roles: string[];
  tokenType?: string;
  iat?: number;
  exp?: number;
}
