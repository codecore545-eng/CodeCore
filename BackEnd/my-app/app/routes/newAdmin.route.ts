import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const userId = Number(req.body.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }
    const newAdmin = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        role: "admin",
      },
    });
    return res.status(200).json({
      message: "User updated to admin successfully",
      user: newAdmin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
