export type AuthResponse = { accessToken: string };

export interface JwtPayload {
  sub: string;
  email: string;
}

export type EncryptResponse = {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
};

export type VaultKeyResponse = EncryptResponse & { salt: Buffer };
