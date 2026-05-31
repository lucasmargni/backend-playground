import DataLoader from "dataloader";
import { prisma } from "../db.js";

const batchFunction = async (ids: readonly string[]) => {
  const users = await prisma.user.findMany({
    where: { id: { in: ids as string[] } },
  });

  const orderedUsers = ids.map((id) => users.find((u) => u.id === id) || null);

  return orderedUsers;
};

export const createUserLoader = () => {
  const userLoader = new DataLoader(batchFunction);

  return userLoader;
};
