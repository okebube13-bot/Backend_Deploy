import User from "../Models_temp/User.js";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ users });
};

// GET STAFF USERS
export const getStaffUsers = async (req, res) => {
  const staff = await User.find({ role: "staff" }).select("-password");
  res.status(200).json({ staff });
};

// GET SINGLE USER
export const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user });
};
