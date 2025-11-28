import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../Controller/authController.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// PRIVATE ROUTE
router.get("/me", protectRoute, getMe);

export default router;
