import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    return res
      .status(500)
      .json({ message: "JWT Secret Key not set in environment variables" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user as JwtPayload;
    next();
  });
};

export const signToken = (username: string, email: string, _id: string) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error("JWT Secret Key not set in environment variables");
  }

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
