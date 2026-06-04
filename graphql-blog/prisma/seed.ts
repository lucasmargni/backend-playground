import { PrismaClient } from "../generated/prisma/index.js";
import "dotenv/config";
import { env } from "prisma/config";
import bcrypt from "bcryptjs";

// Import the driver adapter for your specific database (example uses PostgreSQL)
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });

// Pass the adapter instance to PrismaClient
export const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Users
  const alice = await prisma.user.upsert({
    where: { username: "alice_dev" },
    update: {},
    create: {
      username: "alice_dev",
      email: "alice@example.com",
      password: await bcrypt.hash("alice123", 10),
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob_smith" },
    update: {},
    create: {
      username: "bob_smith",
      email: "bob@example.com",
      password: await bcrypt.hash("bob456", 10),
    },
  });

  const carol = await prisma.user.upsert({
    where: { username: "carol_writes" },
    update: {},
    create: {
      username: "carol_writes",
      email: "carol@example.com",
      password: await bcrypt.hash("carol789", 10),
    },
  });

  const dan = await prisma.user.upsert({
    where: { username: "dan_codes" },
    update: {},
    create: {
      username: "dan_codes",
      email: "dan@example.com",
      password: await bcrypt.hash("dan321", 10),
    },
  });

  const eva = await prisma.user.upsert({
    where: { username: "eva_designs" },
    update: {},
    create: {
      username: "eva_designs",
      email: "eva@example.com",
      password: await bcrypt.hash("eva654", 10),
    },
  });

  console.log("Users created.");

  // Posts
  const post1 = await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      text: "Just set up my first GraphQL API — loving the flexibility compared to REST!",
      tags: ["graphql", "backend", "api"],
      userId: alice.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      text: "Prisma makes database management so much cleaner. Migrations are a breeze.",
      tags: ["prisma", "database", "backend"],
      userId: alice.id,
    },
  });

  const post3 = await prisma.post.upsert({
    where: { id: "seed-post-3" },
    update: {},
    create: {
      id: "seed-post-3",
      text: "Finally understood the N+1 problem in GraphQL. DataLoader is a lifesaver.",
      tags: ["graphql", "performance", "dataloader"],
      userId: bob.id,
    },
  });

  const post4 = await prisma.post.upsert({
    where: { id: "seed-post-4" },
    update: {},
    create: {
      id: "seed-post-4",
      text: "Cursor-based pagination feels complex at first but makes so much sense once it clicks.",
      tags: ["pagination", "graphql"],
      userId: bob.id,
    },
  });

  const post5 = await prisma.post.upsert({
    where: { id: "seed-post-5" },
    update: {},
    create: {
      id: "seed-post-5",
      text: "JWT authentication with Apollo Server context — clean and straightforward.",
      tags: ["auth", "jwt", "apollo"],
      userId: carol.id,
    },
  });

  const post6 = await prisma.post.upsert({
    where: { id: "seed-post-6" },
    update: {},
    create: {
      id: "seed-post-6",
      text: "TypeScript + GraphQL is a great combination. Auto-generated types save so much time.",
      tags: ["typescript", "graphql"],
      userId: dan.id,
    },
  });

  const post7 = await prisma.post.upsert({
    where: { id: "seed-post-7" },
    update: {},
    create: {
      id: "seed-post-7",
      text: "Thinking about design systems and how they translate to backend data structures.",
      tags: ["design", "architecture"],
      userId: eva.id,
    },
  });

  console.log("Posts created.");

  // Comments
  await prisma.comment.upsert({
    where: { id: "seed-comment-1" },
    update: {},
    create: {
      id: "seed-comment-1",
      text: "Totally agree! The ability to request exactly what you need is a game changer.",
      userId: bob.id,
      postId: post1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-2" },
    update: {},
    create: {
      id: "seed-comment-2",
      text: "Have you tried combining it with subscriptions? Real-time data is next level.",
      userId: carol.id,
      postId: post1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-3" },
    update: {},
    create: {
      id: "seed-comment-3",
      text: "Prisma's type safety is unmatched. Never going back to raw SQL for Node projects.",
      userId: dan.id,
      postId: post2.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-4" },
    update: {},
    create: {
      id: "seed-comment-4",
      text: "DataLoader batching is pure magic once you see the query count drop.",
      userId: alice.id,
      postId: post3.id,
      likes: 3,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-5" },
    update: {},
    create: {
      id: "seed-comment-5",
      text: "I struggled with this too. The key for me was understanding the tick-based batching.",
      userId: eva.id,
      postId: post3.id,
      likes: 1,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-6" },
    update: {},
    create: {
      id: "seed-comment-6",
      text: "The Relay spec was confusing at first but the PageInfo pattern is really elegant.",
      userId: carol.id,
      postId: post4.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-7" },
    update: {},
    create: {
      id: "seed-comment-7",
      text: "Context is such a clean way to pass auth info. Way better than request headers everywhere.",
      userId: dan.id,
      postId: post5.id,
      likes: 2,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-8" },
    update: {},
    create: {
      id: "seed-comment-8",
      text: "The codegen tools for TypeScript + GraphQL are also worth checking out.",
      userId: alice.id,
      postId: post6.id,
      likes: 1,
    },
  });

  console.log("Comments created.");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
