import { GraphQLError } from "graphql";
import { findPostById, findPosts, createPost } from "../repository/post.js";
import { findUserById } from "../repository/users.js";
import { findCommentsOfPost } from "../repository/comments.js";

const getPosts = async (_: any, args: any) => {
  const posts = await findPosts();

  return posts;
};

const getPostById = async (_: any, args: any) => {
  const post = await findPostById(args.id);

  if (!post) {
    throw new GraphQLError("post with id not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return post;
};

const addPost = async (_: any, args: any, context: any) => {
  if (!context.user) {
    throw new GraphQLError("user not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const newPost = await createPost(args.text, context.user.id, args.tags);

  return newPost;
};

const postUser = async (parent: any) => {
  const user = await findUserById(parent.userId);

  return user;
};

const postComments = async (parent: any) => {
  const comments = await findCommentsOfPost(parent.id);

  return comments;
};

export const postResolvers = {
  Query: {
    posts: getPosts,
    postById: getPostById,
  },
  Mutation: {
    addPost: addPost,
  },
  Post: {
    user: postUser,
    comments: postComments,
  },
};
