import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const token = authHeader.slice(7);

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }

  try {
    const user = await User.findById(decoded.userId).select(
      "_id name email role organizationId status"
    );

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is unavailable.",
      });
    }

    // Verify organization access for organization admins.
    if (user.role === "orgadmin") {
      if (!user.organizationId) {
        return res.status(403).json({
          success: false,
          message: "No organization is assigned to this account.",
        });
      }

      const organization = await Organization.findOne({
        _id: user.organizationId,
        status: "active",
      }).select("_id");

      if (!organization) {
        return res.status(403).json({
          success: false,
          message: "This organization's access is unavailable.",
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate request.",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

export default authenticate;
