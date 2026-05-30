import { prisma } from "../db.js";

export const findCommentById = async (id: string) => {
  const comment = await prisma.comment.findUnique({ where: { id } });

  return comment;
};

export const findCommentsOfPost = async (postId: string) => {
  const comment = await prisma.comment.findMany({ where: { postId } });

  return comment;
};

export const createComment = async (
  text: string,
  userId: string,
  postId: string,
) => {
  const newComment = await prisma.comment.create({
    data: { text, userId, postId },
  });

  return newComment;
};

export const incrementCommentLikes = async (id: string) => {
  const comment = await prisma.comment.update({
    where: { id },
    data: { likes: { increment: 1 } },
  });

  return comment;
};

export const incrementCommentDislikes = async (id: string) => {
  const comment = await prisma.comment.update({
    where: { id },
    data: { dislikes: { increment: 1 } },
  });

  return comment;
};
