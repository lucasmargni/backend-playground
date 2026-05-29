import { GraphQLError } from "graphql";
import { users, posts } from "../data/index.js";

const getUserById = (_: any, args: any) => {
  const user = users.find((u) => u.id === args.id);

  if (!user) {
    throw new GraphQLError("user with id not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return user;
};

const getUserByUsername = (_: any, args: any) => {
  const user = users.find((u) => u.username === args.username);

  if (!user) {
    throw new GraphQLError("user with username not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return user;
};

const addUser = (_: any, args: any) => {
  if (users.some((u) => u.username === args.username)) {
    throw new GraphQLError("username already exists", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const newUser = {
    id: `u${String(users.length + 1)}`,
    username: args.username,
    email: args.email || null,
    posts: [],
  };

  users.push(newUser);

  return newUser;
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
    posts: (parent: any) =>
      parent.posts.map((pid: any) => posts.find((p) => p.id === pid)),
  },
};
