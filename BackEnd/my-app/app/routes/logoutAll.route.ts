import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

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

router.post("/auth/log-out-all", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    await prisma.session.deleteMany({
      where: {
        userId: payload.id,
      },
    });
    return res.status(200).json({
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
