export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  tenantId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
