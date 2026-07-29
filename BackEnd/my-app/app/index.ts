// =========================================
// === . ! Official CodeCore Project ! . ===
// =========================================

import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import path from "node:path";
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";
import ownerMiddleware from "./middleware/ownerMiddleware.js";
import registerRoute from "./routes/register.route.js";
import logInRoute from "./routes/logIn.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import newAdminRoute from "./routes/newAdmin.route.js";
import resetPassword from "./routes/resetPassword.route.js";
import logout from "./routes/logout.route.js";
import forgotPassword from "./routes/forgotPassword.route.js";
import emailVerification from "./routes/emailVerification.route.js";

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(process.cwd(), "views")));

app.use("/api", registerRoute);
app.use("/api", logInRoute);
app.use("/api", resetPassword);
app.use("/api", logout);
app.use("/api", forgotPassword);
app.use("/api", emailVerification);
app.use("/api/admin", authMiddleware, adminMiddleware, dashboardRoute);
app.use("/api/new/admin", authMiddleware, ownerMiddleware, newAdminRoute);

app.get("/", (req, res) => {
  const indexPath = path.join(process.cwd(), "views", "index.html");
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`The server has running on: http://localhost:${PORT}`);
});

export default app;
