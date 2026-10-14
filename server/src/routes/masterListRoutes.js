
import express from "express";
import mongoose from "mongoose";
import authenticate, {
    authorizeRoles,
} from "../middleware/auth.js";
import MasterList from "../models/MasterList.js";

const router = express.Router();

// Get master lists belonging to the logged-in organization.
router.get(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const lists = await MasterList.find({
                organizationId: req.user.organizationId,
            }).sort({ updatedAt: -1 });

            return res.json({
                success: true,
                lists,
            });
        } catch (error) {
            console.error("Fetch master lists error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch master lists.",
            });
        }
    }
);

/* =========================================================
   UPDATE IMPORTED DATA IN A MASTER LIST
========================================================= */

router.put(
    "/:id",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { fields, records } = req.body;
            const { id } = req.params;

            // Validate MongoDB list ID
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid master list ID.",
                });
            }

            // Both fields and records must be arrays
            if (!Array.isArray(fields) || !Array.isArray(records)) {
                return res.status(400).json({
                    success: false,
                    message: "Fields and records must be arrays.",
                });
            }

            // Update only a list belonging to this organization
            const list = await MasterList.findOneAndUpdate(
                {
                    _id: id,
                    organizationId: req.user.organizationId,
                },
                {
                    $set: {
                        fields,
                        records,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: "Master list not found in your organization.",
                });
            }

            return res.json({
                success: true,
                message: "Imported data saved successfully.",
                list,
            });
        } catch (error) {
            console.error("Update master list error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to save imported data.",
            });
        }
    }
);


/* =========================================================
   DELETE A MASTER LIST
========================================================= */

router.delete(
    "/:id",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate MongoDB list ID.
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid master list ID.",
                });
            }

            // Delete only a list belonging to this organization.
            const deletedList = await MasterList.findOneAndDelete({
                _id: id,
                organizationId: req.user.organizationId,
            });

            if (!deletedList) {
                return res.status(404).json({
                    success: false,
                    message: "Master list not found in your organization.",
                });
            }

            return res.json({
                success: true,
                message: "Master list deleted successfully.",
            });
        } catch (error) {
            console.error(
                "Delete master list error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to delete master list.",
            });
        }
    }
);


// Create a master list for the logged-in organization.
router.post(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { listName, tabName, fields, records } = req.body;

            if (
                typeof listName !== "string" ||
                !listName.trim() ||
                typeof tabName !== "string" ||
                !tabName.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "List name and tab name are required.",
                });
            }

            if (
                (fields !== undefined && !Array.isArray(fields)) ||
                (records !== undefined && !Array.isArray(records))
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Fields and records must be arrays.",
                });
            }

            const list = await MasterList.create({
                organizationId: req.user.organizationId,
                createdBy: req.user._id,
                listName: listName.trim(),
                tabName: tabName.trim(),
                fields: fields ?? [],
                records: records ?? [],
            });

            return res.status(201).json({
                success: true,
                message: "Master list created successfully.",
                list,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "A list with this tab name already exists.",
                });
            }

            console.error("Create master list error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to create master list.",
            });
        }
    }
);


export default router;
