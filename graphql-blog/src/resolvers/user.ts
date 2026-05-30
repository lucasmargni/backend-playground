import { GraphQLError } from "graphql";
import {
  findUserById,
  findUserByUsername,
  createUser,
} from "../repository/users.js";
import { findPostsOfUser } from "../repository/post.js";

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

const addUser = async (_: any, args: any) => {
  const user = await findUserByUsername(args.username);

  if (user) {
    throw new GraphQLError("username already exists", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const newUser = await createUser(args.username, args.email);

  return newUser;
};

const userPosts = async (parent: any) => {
  const posts = await findPostsOfUser(parent.id);

  return posts;
};

export const userResolvers = {
  Query: {
    userById: getUserById,
    userByUsername: getUserByUsername,
  },
  Mutation: {
    addUser: addUser,
  },
  User: {
    posts: userPosts,
  },
};
