import { GraphQLError } from "graphql";
import { users, posts, comments } from "../data/index.js";

const getPostById = (_: any, args: any) => {
  const post = posts.find((p) => p.id === args.id);

  if (!post) {
    throw new GraphQLError("post with id not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return post;
};

const addPost = (_: any, args: any) => {
  const user = users.find((u) => u.id === args.userId);

  if (!user) {
    throw new GraphQLError("user not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const newPost = {
    id: `p${String(posts.length + 1)}`,
    text: args.text,
    tags: args.tags,
    user: args.userId,
    comments: [],
  };

  posts.push(newPost);
  user.posts.push(newPost.id);

  return newPost;
};

export const postResolvers = {
  Query: {
    posts: () => posts,
    postById: getPostById,
  },
  Mutation: {
    addPost: addPost,
  },
  Post: {
    user: (parent: any) => users.find((u) => u.id === parent.user),
    comments: (parent: any) =>
      parent.comments.map((cid: any) => comments.find((c) => c.id === cid)),
  },
};
