import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername, createUser } from "../repository/users.js";

const register = async (_: any, args: any) => {
  const user = await findUserByUsername(args.username);

  if (user) {
    throw new GraphQLError("username already exists", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const hashedPass = await bcrypt.hash(args.password, 10);

  const newUser = await createUser(args.username, hashedPass, args.email);

  const token = jwt.sign(
    { userId: newUser.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return { user: newUser, token };
};

const login = async (_: any, args: any) => {
  const user = await findUserByUsername(args.username);

  if (!user) {
    throw new GraphQLError("user with username not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const authenticated = await bcrypt.compare(args.password, user.password);

  if (!authenticated) {
    throw new GraphQLError("credentials do not match", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return { user, token };
};

export const authResolvers = {
  Mutation: {
    register: register,
    login: login,
  },
};
