import { Router } from "express";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { z } from "zod";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const logInSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
});

router.post("/auth/log-in", async (req, res) => {
  try {
    const result = logInSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }
    const { username, email, password } = result.data;
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
      },
      JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });
    return res.status(200).json({
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
