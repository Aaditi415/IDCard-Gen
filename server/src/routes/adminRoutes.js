import express from "express";
import authenticate, {
  authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("superadmin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Super Admin access verified!",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

export default router;
