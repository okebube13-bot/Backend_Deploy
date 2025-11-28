export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User invalid: Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(400).json({
        message: "Your statusis not up to per, you can't access this feature",
      });
    } else {
      next();
    }
  };
};
