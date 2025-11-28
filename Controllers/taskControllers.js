import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { taskAssignedTemplate } from "../utils/emailTemplates.js";
import {
  cloudinary,
  uploadToCloudinary,
} from "../middlewares/UploadMiddleware.js";

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, priority, createdBy } =
      req.body;

    if (!title || !description || !dueDate || !assignedTo || !priority) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo id" });
    }

    if (req.user.role === "student") {
      return res.status(403).json({ message: "Students cannot create tasks" });
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    // Staff can only assign to students
    if (req.user.role === "staff" && assignedUser.role !== "student") {
      return res.status(403).json({
        message: "Staff can only assign tasks to students",
      });
    }

    // Parse dueDate
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate" });
    }

    // ✅ Upload images to Cloudinary
    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(
          file.buffer,
          "task-images",
          "image"
        );
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // ✅ Upload files to Cloudinary
    const files = [];
    if (req.files?.files) {
      for (const file of req.files.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "task-files",
          "auto"
        );
        files.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    }

    // ✅ Create the task WITH images and files
    const task = await Task.create({
      title,
      description,
      dueDate: due,
      priority,
      assignedTo,
      createdBy,
      images,
      files,
    });

    // ✅ Send email
    await sendEmail({
      to: assignedUser.email,
      subject: "New Task Assigned",
      html: taskAssignedTemplate(assignedUser, task),
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully + email sent successfully",
      task,
    });
  } catch (err) {
    console.error("createTask error:", err.stack || err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating task",
      error: err.message,
    });
  }
};

// GET TASKS (Role-Based)
export const getTasks = async (req, res) => {
  try {
    let tasks = [];

    if (req.user.role === "manager") {
      tasks = await Task.find()
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");
    }

    if (req.user.role === "staff") {
      tasks = await Task.find({
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      })
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");
    }

    if (req.user.role === "student") {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role");
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE TASK STATUS
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";

    // Who can update a task?
    if (!isAssigned && !isCreator && !isManager) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: "Task status updated",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";

    if (!isAssigned && !isCreator && !isManager) {
      return res.status(403).json({ message: "Not authorized to delete task" });
    }

    if (task.files && task.files.length > 0) {
      for (const file of task.files) {
        if (file.publicId) {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: "raw",
          });
        }
      }
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Adding images to tasks
export const addImageToTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task Id" });
    }
    const task = await Task.findById(id);
    if (!task) return res.status(400).json({ message: "Task not found" });

    // Check authorization
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";
    if (!isCreator && !isManager) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "task-images",
      "image"
    );

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    task.images.push(newImage);
    await task.save();

    res.json({
      success: true,
      message: "Image uploaded successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Add file to task
export const addFileToTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task Id" });
    }
    const task = await Task.findById(id);
    if (!task) return res.status(400).json({ message: "Task not found" });

    // Authorization check
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";

    if (!isCreator && !isManager) {
      return res
        .status(403)
        .json({ message: "Not authorized to perform action" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "task-files",
      "auto"
    );

    const newFile = {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    };

    task.files.push(newFile);
    await task.save();

    res.json({
      success: true,
      message: "file added successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// deleteImageFromTask and deleteFileFromTask remain the same
export const deleteImageFromTask = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const image = task.images.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete from cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Remove from task
    task.images.pull(imageId);
    await task.save();

    res.json({
      success: true,
      message: "Image deleted successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE FILE FROM TASK
export const deleteFileFromTask = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const file = task.files.id(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Delete from cloudinary
    await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });

    // Remove from task
    task.files.pull(fileId);
    await task.save();

    res.json({
      success: true,
      message: "File deleted successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
