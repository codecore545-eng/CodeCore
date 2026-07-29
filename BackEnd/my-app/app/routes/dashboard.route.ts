import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        avatarUrl: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isDisable: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
