import DataLoader from "dataloader";
import { prisma } from "../db.js";

const batchFunction = async (ids: readonly string[]) => {
  const posts = await prisma.post.findMany({
    where: { id: { in: ids as string[] } },
  });

  const orderedPosts = ids.map((id) => posts.find((u) => u.id === id) || null);

  return orderedPosts;
};

const batchFunctionUsers = async (userIds: readonly string[]) => {
  const posts = await prisma.post.findMany({
    where: { userId: { in: userIds as string[] } },
  });

  const orderedPosts = userIds.map((uid) =>
    posts.filter((p) => p.userId === uid),
  );

  return orderedPosts;
};

export const createPostLoader = () => {
  const postLoader = new DataLoader(batchFunction);

  return postLoader;
};

export const createUserPostsLoader = () => {
  const userPostsLoader = new DataLoader(batchFunctionUsers);

  return userPostsLoader;
};
