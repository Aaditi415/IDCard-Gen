
import express from "express";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Use the same response for unknown users and incorrect passwords.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is unavailable.",
      });
    }

    if (user.role === "orgadmin") {
      if (!user.organizationId) {
        return res.status(403).json({
          success: false,
          message: "This account has no assigned organization.",
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

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
});

router.get("/me", authenticate, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            organizationId: req.user.organizationId,
        },
    });
});

export default router;
