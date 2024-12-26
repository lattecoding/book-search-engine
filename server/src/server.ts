import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./Schemas/typeDefs";
import { resolvers } from "./Schemas/resolvers";
import { authMiddleware } from "./auth";

const app = express();
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`,
    );
  });
}

startServer();
