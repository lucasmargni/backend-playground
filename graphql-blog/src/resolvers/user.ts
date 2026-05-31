import { GraphQLError } from "graphql";
import { findUserById, findUserByUsername } from "../repository/users.js";

const getUserById = async (_: any, args: any) => {
  const user = await findUserById(args.id);

  if (!user) {
    throw new GraphQLError("user with id not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return user;
};

const getUserByUsername = async (_: any, args: any) => {
  const user = await findUserByUsername(args.username);

  if (!user) {
    throw new GraphQLError("user with username not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return user;
};

const userPosts = async (parent: any, _: any, context: any) => {
  const posts = context.loaders.userPosts.load(parent.id);

  return posts;
};

export const userResolvers = {
  Query: {
    userById: getUserById,
    userByUsername: getUserByUsername,
  },
  User: {
    posts: userPosts,
  },
};
