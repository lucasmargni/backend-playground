import { prisma } from "../db.js";

export const findPostById = async (id: string) => {
  const post = await prisma.post.findUnique({ where: { id } });

  return post;
};

export const findPosts = async () => {
  const posts = await prisma.post.findMany();

  return posts;
};

export const findPostsOfUser = async (userId: string) => {
  const posts = await prisma.post.findMany({ where: { userId } });

  return posts;
};

export const createPost = async (
  text: string,
  userId: string,
  tags?: string[],
) => {
  const newPost = await prisma.post.create({ data: { text, tags, userId } });

  return newPost;
};
