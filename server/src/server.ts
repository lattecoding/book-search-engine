import express from "express";
import path from "node:path";
import { ApolloServer } from "apollo-server-express";
import db from "./config/connection";
import { typeDefs, resolvers } from "./schemas"; // Correct the import path if needed
import { authenticateToken } from "./utils/auth"; // If you are using the auth middleware

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Pass the user from the request if authenticated
    if (req.user) {
      return { user: req.user };
    }
    return {}; // If no user, return empty context
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply authentication middleware
app.use(authenticateToken);

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Start Apollo Server as middleware
server.applyMiddleware({ app });

db.once("open", () => {
  app.listen(PORT, () =>
    console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`),
  );
});
