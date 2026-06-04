import type { User } from "../../generated/prisma/client.js";

export type { User };

export type SafeUser = Omit<User, "password">;

export interface RegisterBody {
  username: string;
  email?: string;
  password: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
}
