import { PrismaClient } from "../generated/prisma/index.js";
import "dotenv/config";
import { env } from "prisma/config";

// Import the driver adapter for your specific database (example uses PostgreSQL)
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });

// Pass the adapter instance to PrismaClient
export const prisma = new PrismaClient({ adapter });
