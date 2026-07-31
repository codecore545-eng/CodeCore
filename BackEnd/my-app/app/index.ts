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
import chalk from "chalk";
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";
import ownerMiddleware from "./middleware/ownerMiddleware.js";
import registerRoute from "./routes/register.route.js";
import logInRoute from "./routes/logIn.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import newAdminRoute from "./routes/newAdmin.route.js";
import logout from "./routes/logout.route.js";
import forgotPassword from "./routes/forgotPassword.route.js";
import resetPassword from "./routes/resetPassword.route.js";
import emailVerification from "./routes/emailVerification.route.js";
import refreshToken from "./routes/refreshToken.route.js";
import logoutAll from "./routes/logoutAll.route.js";

const app = express();
const PORT = process.env.PORT || 1000;
const NODE_ENV = process.env.NODE_ENV;
const CLIENT_URL = process.env.CLIENT_URL;
const theYear = new Date();

if (NODE_ENV === "production" && !CLIENT_URL) {
  throw new Error(
    "CLIENT_URL is not defined, Please read the README.md file and follow the steps to avoid errors.",
  );
}

app.use(
  cors(
    NODE_ENV === "production"
      ? { origin: CLIENT_URL, credentials: true }
      : { origin: true, credentials: true },
  ),
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(process.cwd(), "views")));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", registerRoute);
app.use("/api", logInRoute);
app.use("/api", resetPassword);
app.use("/api", logout);
app.use("/api", forgotPassword);
app.use("/api", emailVerification);
app.use("/api", refreshToken);
app.use("/api", logoutAll);
app.use("/api/admin", authMiddleware, adminMiddleware, dashboardRoute);
app.use("/api/new/admin", authMiddleware, ownerMiddleware, newAdminRoute);

app.get("/", (req, res) => {
  const indexPath = path.join(process.cwd(), "views", "index.html");
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(
    chalk.cyan(`
 ██████╗ ██████╗ ██████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║     ██║   ██║██║  ██║█████╗  ██║     ██║   ██║██████╔╝█████╗
██║     ██║   ██║██║  ██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝
╚██████╗╚██████╔╝██████╔╝███████╗╚██████╗╚██████╔╝██║  ██║███████╗
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
`),
  );
  console.log("=".repeat(60));
  console.log("Warnings");
  console.log(
    " - To avoid errors, please read the README.md file or contact the project owner, Neves .",
  );
  console.log("Running");
  console.log(` - The server has running on: http://localhost:${PORT}`);
  console.log("Rights");
  console.log(` - © ${theYear.getFullYear()} CodeCore. All Rights Reserved.`);
  console.log("=".repeat(60));
});

export default app;
