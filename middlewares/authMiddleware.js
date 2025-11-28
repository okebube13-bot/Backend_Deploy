import jwt from "jsonwebtoken";
import User from "../Models_temp/User.js";

export const protectRoute = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "No token, authorization denied" });
  } catch (err) {
    console.error("protectRoute error:", err.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const managerOnly = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ message: "Access denied. Managers only." });
  }
  next();
};
