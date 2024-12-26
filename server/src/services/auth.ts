import jwt from "jsonwebtoken";
import { Request } from "express";

const secret = "yourSecretKey"; // Replace with your actual secret key
const expiration = "2h";

export const authMiddleware = ({ req }: { req: Request }) => {
  // Extract token from the request headers
  let token = req.headers.authorization || "";
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as any;
    req.user = data;
  } catch {
    console.log("Invalid token");
  }

  return req;
};
