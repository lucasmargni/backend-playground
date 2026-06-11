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

export type SecretResponse = {
  name: string;
  value: string;
};

export type SecretSummary = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
};
