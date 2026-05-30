import { prisma } from "../db.js";

export const findUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  return user;
};

export const findUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({ where: { username } });

  return user;
};

export const createUser = async (
  username: string,
  password: string,
  email?: string,
) => {
  const newUser = await prisma.user.create({
    data: { username, password, email },
  });

  return newUser;
};
