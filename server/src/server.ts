import express, { Request, Response } from "express";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./schemas"; // Your GraphQL schemas
import db from "./config/connection"; // MongoDB connection
import { expressMiddleware } from "@apollo/server/express4"; // Middleware for Apollo Server with Express
import { authenticateToken } from "./services/auth"; // Auth utility, if you use JWT auth

const startApolloServer = async () => {
  try {
    await db();
    const PORT = process.env.PORT || 3001;
    const app = express();

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: ({ req }) => ({ token: authenticateToken(req) }),
      }),
    );

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../client/dist")));

      app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
      });
    }

    await server.start();
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Error starting Apollo Server:", error);
    process.exit(1);
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startApolloServer();
