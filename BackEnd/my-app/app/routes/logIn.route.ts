import { Router } from "express";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { z } from "zod";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const NODE_ENV = process.env.NODE_ENV;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

if (!JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_REFRESH_SECRET is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

if (!NODE_ENV) {
  throw new Error(
    "NODE_ENV is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

const logInSchema = z.object({
  identifier: z.string().trim().min(3).max(255),
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
    const { identifier, password } = result.data;
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier.toLocaleLowerCase() },
        ],
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
        expiresIn: "1h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
      path: "/",
    });
    const refreshToken = jwt.sign(
      {
        id: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
      },
      JWT_REFRESH_SECRET!,
      {
        expiresIn: "30d",
      },
    );
    await prisma.session.create({
      data: {
        userId: existingUser.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
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
