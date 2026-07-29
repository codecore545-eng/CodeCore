import { Router } from "express";
import "dotenv/config";
import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const router = Router();
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

router.post("/auth/send-verification-email", async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.users.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: tokenExpires,
      },
    });
    const verifyUrl = `${FRONTEND_URL}/auth/verify-email/${verificationToken}`;
    console.log(EMAIL_USER);
    console.log(EMAIL_PASSWORD);
    await transporter.verify();
    console.log("SMTP OK");
    await transporter.sendMail({
      from: `"Support Team" <${EMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome!</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          <p style="margin-top: 20px; color: #666;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
      text: `Please verify your email address by clicking the link: ${verifyUrl}`,
    });
    res.status(200).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
