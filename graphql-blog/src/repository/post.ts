import { prisma } from "../db.js";

export const findPostById = async (id: string) => {
  const post = await prisma.post.findUnique({ where: { id } });

  return post;
};

export const findPosts = async ({
  first,
  after,
  userId,
  tag,
}: {
  first?: number;
  after?: string;
  userId?: string;
  tag?: string;
} = {}) => {
  const idCursor = after ? Buffer.from(after, "base64").toString("utf-8") : "";

  const posts = await prisma.post.findMany({
    where: {
      ...(userId && { userId }),
      ...(tag && { tags: { has: tag } }),
    },
    ...(first && { take: first + 1 }),
    ...(idCursor && { cursor: { id: idCursor }, skip: 1 }),
    orderBy: { createdAt: "asc" },
  });

  const hasNextPage = first ? posts.length > first : false;

  const pagePosts = hasNextPage ? posts.slice(0, first) : posts;

  const edges = pagePosts.map((p) => ({
    node: p,
    cursor: Buffer.from(p.id).toString("base64"),
  }));

  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
  };
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
