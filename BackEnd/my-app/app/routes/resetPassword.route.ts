import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/auth/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const password = req.body.password;
    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await prisma.users.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
