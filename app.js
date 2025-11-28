// server.js

import express from "express";
import mongoose from "mongoose";

import dotenv from "dotenv";

import cors from "cors";

import morgan from "morgan";

import helmet from "helmet";

import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import testRoute from "./routes/testRoute.js";
import Email from "./routes/Email.js";
// e("./middlewares/authMiddleware");
// e("./middlewares/authorizeRoles");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for frontend access
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

// Middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Task Management API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", Email);
app.use("/api/test", testRoute);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
