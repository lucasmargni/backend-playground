export type AuthResponse = { accessToken: string };

export interface JwtPayload {
  sub: string;
  email: string;
}
