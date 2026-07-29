import { Router } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

router.post("/auth/forgot-password", async (req, res) => {
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
      return res.status(200).json({
        message:
          "If the email is registered, a password reset link has been sent.",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenExpires = new Date(Date.now() + 3600000);
    await prisma.users.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: tokenExpires,
      },
    });
    const resetUrl = `${FRONTEND_URL}/auth/reset-password/${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          You requested to reset your password. Click the button below to set up a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #777777; font-size: 14px;">
          This link will expire in 1 hour. If you did not request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #999999; font-size: 12px; text-align: center;">
          If the button above doesn't work, copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
        </p>
      </div>
    `;
    await transporter.sendMail({
      from: `"Support Team" <${EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: htmlContent,
      text: `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you didn't request this, please ignore this email.`,
    });
    return res.status(200).json({
      message:
        "If the email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
