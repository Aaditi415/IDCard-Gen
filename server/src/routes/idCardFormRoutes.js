
import express from "express";
import mongoose from "mongoose";
import authenticate, {
    authorizeRoles,
} from "../middleware/auth.js";
import IDCardForm from "../models/IDCardForm.js";

const router = express.Router();

/* =========================================================
   GET ALL FORMS FOR THE LOGGED-IN ORGANIZATION
========================================================= */

router.get(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const forms = await IDCardForm.find({
                organizationId: req.user.organizationId,
            }).sort({ updatedAt: -1 });

            return res.json({
                success: true,
                forms,
            });
        } catch (error) {
            console.error("Fetch ID card forms error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch ID card forms.",
            });
        }
    }
);

/* =========================================================
   GET ONE FORM
========================================================= */

router.get(
    "/:id",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID card form ID.",
                });
            }

            const form = await IDCardForm.findOne({
                _id: id,
                organizationId: req.user.organizationId,
            });

            if (!form) {
                return res.status(404).json({
                    success: false,
                    message: "ID card form not found.",
                });
            }

            return res.json({
                success: true,
                form,
            });
        } catch (error) {
            console.error("Fetch ID card form error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch the ID card form.",
            });
        }
    }
);

/* =========================================================
   CREATE A NEW ID CARD FORM
========================================================= */

router.post(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { name, fields } = req.body;

            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Form name is required.",
                });
            }

            if (!Array.isArray(fields)) {
                return res.status(400).json({
                    success: false,
                    message: "Fields must be an array.",
                });
            }

            const form = await IDCardForm.create({
                organizationId: req.user.organizationId,
                createdBy: req.user._id,
                name: name.trim(),
                fields,
            });

            return res.status(201).json({
                success: true,
                message: "ID card form created successfully.",
                form,
            });
        } catch (error) {
            console.error("Create ID card form error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to create the ID card form.",
            });
        }
    }
);

export default router;
