import { GraphQLError } from "graphql";
import { users, posts, comments } from "../data/index.js";

const addComment = (_: any, args: any) => {
  const user = users.find((u) => u.id === args.userId);
  const post = posts.find((p) => p.id === args.postId);

  if (!user) {
    throw new GraphQLError("user not found", {
      extensions: { code: "NOT_FOUND" },
    });
  } else if (!post) {
    throw new GraphQLError("post not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const newComment = {
    id: `c${String(comments.length + 1)}`,
    text: args.text,
    likes: 0,
    dislikes: 0,
    user: args.userId,
    post: args.postId,
  };

  comments.push(newComment);

  post.comments.push(newComment.id);

  return newComment;
};

const likeComment = (_: any, args: any) => {
  const comment = comments.find((c) => c.id === args.commentId);

  if (!comment) {
    throw new GraphQLError("comment not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  comment.likes++;

  return comment;
};

const dislikeComment = (_: any, args: any) => {
  const comment = comments.find((c) => c.id === args.commentId);

  if (!comment) {
    throw new GraphQLError("comment not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  comment.dislikes++;

  return comment;
};

export const commentResolvers = {
  Mutation: {
    addComment: addComment,
    likeComment: likeComment,
    dislikeComment: dislikeComment,
  },
  Comment: {
    user: (parent: any) => users.find((u) => u.id === parent.user),
    post: (parent: any) => posts.find((p) => p.id === parent.post),
  },
};
