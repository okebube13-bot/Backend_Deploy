import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controller/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// PRIVATE ROUTE
router.get("/me", protectRoute, getMe);

export default router;
