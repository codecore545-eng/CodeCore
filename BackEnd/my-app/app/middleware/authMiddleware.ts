import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

type AuthPayload = JwtPayload & {
  id: number;
  username: string;
  role: string;
};

const isAuthPayload = (
  decoded: string | JwtPayload,
): decoded is AuthPayload => {
  return (
    typeof decoded !== "string" &&
    typeof decoded.id == "number" &&
    typeof decoded.username == "string" &&
    typeof decoded.role == "string"
  );
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET!);
    if (!isAuthPayload(decoded)) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
