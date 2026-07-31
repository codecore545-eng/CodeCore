import { Router } from "express";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { z } from "zod";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

if (!NODE_ENV) {
  throw new Error(
    "NODE_ENV is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  firstName: z.string().trim().min(3).max(50),
  lastName: z.string().trim().min(3).max(50),
  email: z.string().trim().toLowerCase().email().max(255),
  phoneNumber: z.string().trim().min(8).max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(128),
});

router.post("/auth/register", async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }
    const { username, firstName, lastName, email, phoneNumber, password } =
      result.data;
    const hashedPassword = await bcrypt.hash(password, 12);
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });
    if (existingUser) {
      return res.status(409).json({
        message: "Username, email, or phone number is already in use",
      });
    }
    const user = await prisma.users.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
      },
    });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
