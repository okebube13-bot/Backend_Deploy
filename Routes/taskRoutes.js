import express from "express";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
  addImageToTask,
  addFileToTask,
  deleteImageFromTask,
  deleteFileFromTask,
} from "../Controller/taskControllers.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";
import { uploadImages, uploadFiles } from "../Middlewares/UploadMiddleware.js";

const router = express.Router();

// Create task with images and files
router.post(
  "/create",
  protectRoute,
  uploadImages.fields([
    { name: "images", maxCount: 5 },
    { name: "files", maxCount: 5 },
  ]),
  createTask
);

router.get("/get", protectRoute, getTasks);
router.put("/:id/status", protectRoute, updateTaskStatus);
router.delete("/:id", protectRoute, deleteTask);

// Add image to existing task
router.post(
  "/:id/images",
  protectRoute,
  uploadImages.single("image"),
  addImageToTask
);

// Add file to existing task
router.post(
  "/:id/files",
  protectRoute,
  uploadFiles.single("file"),
  addFileToTask
);

// Delete image from task
router.delete("/:id/images/:imageId", protectRoute, deleteImageFromTask);

// Delete file from task
router.delete("/:id/files/:fileId", protectRoute, deleteFileFromTask);

export default router;
