import express from "express";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./schemas"; // Your GraphQL schemas
import db from "./config/connection"; // MongoDB connection
import { expressMiddleware } from "@apollo/server/express4"; // Middleware for Apollo Server with Express
import { authenticateToken } from "./services/auth"; // Auth utility, if you use JWT auth

const PORT = process.env.PORT || 3001;
const app = express();

// Validate environment variables
if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT Secret Key must be set in the environment variables");
}

// Create ApolloServer instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    let user = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        user = authenticateToken(token); // Authentication logic
      } catch (error) {
        console.error("Authentication error:", error);
      }
    }
    return { user }; // Context now contains the user object
  },
});

// Function to start the Apollo server
const startApolloServer = async () => {
  try {
    // Start the Apollo Server
    await server.start();

    // Use Express middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Apply authentication middleware before other middleware that might need the user context
    app.use("/graphql", expressMiddleware(server));

    // Serve static assets if we're in production
    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../client/dist")));

      app.get("*", (_req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
      });
    }

    // Handle MongoDB connection errors
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1); // Exit the server with an error code
    });

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start Apollo Server:", error);
    process.exit(1); // Exit the server with an error code
  }
};

// Start the Apollo Server and Express App
startApolloServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await db.close(); // Close MongoDB connection
  process.exit(0);
});
