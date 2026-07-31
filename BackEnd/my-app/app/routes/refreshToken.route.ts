import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const NODE_ENV = process.env.NODE_ENV;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET or JWT_REFRESH_SECRET is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

if (!JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_REFRESH_SECRET is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

if (!NODE_ENV) {
  throw new Error("NODE_ENV is not defined");
}

router.post("/auth/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }
    jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
      },
      include: {
        user: true,
      },
    });
    if (!session) {
      return res.status(401).json({
        message: "Session expired",
      });
    }
    if (session.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Session expired",
      });
    }
    const accessToken = jwt.sign(
      {
        id: session.userId,
        username: session.user.username,
        role: session.user.role,
      },
      JWT_SECRET!,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });
    return res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
