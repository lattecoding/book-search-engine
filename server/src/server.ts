import express from "express";
import path from "node:path";
import { ApolloServer } from "apollo-server-express";
import db from "./config/connection.js";
import routes from "./routes/index.js";
import { typeDefs, resolvers } from "./Schemas";
import { authMiddleware } from "./services/auth";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.use(routes);

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const user = authMiddleware({ req });
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`,
      );
    });
  });
};

startApolloServer();
