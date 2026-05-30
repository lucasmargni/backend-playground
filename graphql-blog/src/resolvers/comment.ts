import { GraphQLError } from "graphql";
import {
  findCommentById,
  createComment,
  incrementCommentLikes,
  incrementCommentDislikes,
} from "../repository/comments.js";
import { findUserById } from "../repository/users.js";
import { findPostById } from "../repository/post.js";

const addComment = async (_: any, args: any, context: any) => {
  if (!context.user) {
    throw new GraphQLError("user not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const post = await findPostById(args.postId);

  if (!post) {
    throw new GraphQLError("post not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const newComment = await createComment(
    args.text,
    context.user.id,
    args.postId,
  );

  return newComment;
};

const likeComment = async (_: any, args: any, context: any) => {
  if (!context.user) {
    throw new GraphQLError("user not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const comment = await findCommentById(args.id);

  if (!comment) {
    throw new GraphQLError("comment not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const updatedComment = await incrementCommentLikes(args.id);

  return updatedComment;
};

const dislikeComment = async (_: any, args: any, context: any) => {
  if (!context.user) {
    throw new GraphQLError("user not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const comment = await findCommentById(args.id);

  if (!comment) {
    throw new GraphQLError("comment not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const updatedComment = await incrementCommentDislikes(args.id);

  return updatedComment;
};

const commentUser = async (parent: any) => {
  const user = await findUserById(parent.userId);

  return user;
};

const commentPost = async (parent: any) => {
  const post = await findPostById(parent.postId);

  return post;
};

export const commentResolvers = {
  Mutation: {
    addComment: addComment,
    likeComment: likeComment,
    dislikeComment: dislikeComment,
  },
  Comment: {
    user: commentUser,
    post: commentPost,
  },
};
