import express from "express";
import {
  getAllUsers,
  getStaffUsers,
  getSingleUser,
} from "./controller/userController.js";
import { protectRoute, managerOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET ALL USERS (MANAGER ONLY)
router.get("/", protectRoute, managerOnly, getAllUsers);

// GET ONLY STAFF USERS (MANAGER ONLY)
router.get("/staff", protectRoute, managerOnly, getStaffUsers);

// GET ONE USER (MANAGER OR STAFF CAN SEE THEMSELVES)
router.get("/:id", protectRoute, getSingleUser);

export default router;
