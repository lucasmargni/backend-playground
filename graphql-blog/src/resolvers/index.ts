import { mergeResolvers } from "@graphql-tools/merge";
import { userResolvers } from "./user.js";
import { postResolvers } from "./post.js";
import { commentResolvers } from "./comment.js";

export const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  commentResolvers,
]);
