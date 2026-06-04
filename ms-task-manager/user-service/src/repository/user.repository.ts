import { prisma } from "../db.js";

import type { User } from "../types/index.js";

export const findUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { id } });

  return user;
};

export const findUserByUsername = async (
  username: string,
): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { username } });

  return user;
};

export const createUser = async (
  username: string,
  password: string,
  email?: string,
): Promise<User> => {
  const newUser = await prisma.user.create({
    data: { username, password, email },
  });

  return newUser;
};
