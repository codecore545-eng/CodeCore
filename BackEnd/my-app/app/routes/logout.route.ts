import { Router } from "express";
import prisma from "../lib/prisma.js";
import "dotenv/config";

const router = Router();
const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
  throw new Error(
    "NODE_ENV is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

router.post("/auth/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(200).json({
        message: "Logged out successfully",
      });
    }
    await prisma.session.deleteMany({
      where: {
        refreshToken,
      },
    });
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
