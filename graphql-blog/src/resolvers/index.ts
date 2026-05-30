import { mergeResolvers } from "@graphql-tools/merge";
import { userResolvers } from "./user.js";
import { postResolvers } from "./post.js";
import { commentResolvers } from "./comment.js";
import { authResolvers } from "./auth.js";

export const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  commentResolvers,
  authResolvers,
]);
