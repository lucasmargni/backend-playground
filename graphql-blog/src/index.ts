import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers/index.js";
import { findUserById } from "./repository/users.js";
import fs from "fs";
import jwt from "jsonwebtoken";

const typeDefs = fs.readFileSync("src/schema.graphql", "utf-8");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization || "";

    if (!auth) {
      return { user: null };
    }

    const token = auth.split(" ")[1];

    try {
      const payloadToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as { userId: string };

      const user = await findUserById(payloadToken.userId);

      return { user };
    } catch {
      return { user: null };
    }
  },
});

console.log(`Server ready at: ${url}`);
