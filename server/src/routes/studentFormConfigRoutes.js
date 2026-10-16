import express from "express";
import mongoose from "mongoose";
import authenticate, {
    authorizeRoles,
} from "../middleware/auth.js";

import StudentFormConfig from "../models/StudentFormConfig.js";
import MasterList from "../models/MasterList.js";

const router = express.Router();

/* =========================================================
   PUBLIC: GET STUDENT FORM CONFIGURATION BY SLUG

   Keep this route before "/:id".
========================================================= */

router.get("/public/:slug", async (req, res) => {
    try {
        const slug = String(req.params.slug || "")
            .trim()
            .toLowerCase();

        const config = await StudentFormConfig.findOne({
            slug,
            isActive: true,
        }).lean();

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Student form not found or is inactive.",
            });
        }

        return res.json({
            success: true,
            config,
        });
    } catch (error) {
        console.error(
            "Fetch public student form error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch the student form.",
        });
    }
});

/* =========================================================
   ADMIN: GET ALL CONFIGURATIONS FOR THE ORGANIZATION
========================================================= */

router.get(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const configs = await StudentFormConfig.find({
                organizationId: req.user.organizationId,
            }).sort({ updatedAt: -1 });

            return res.json({
                success: true,
                configs,
            });
        } catch (error) {
            console.error(
                "Fetch student form configurations error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to fetch student forms.",
            });
        }
    }
);

/* =========================================================
   ADMIN: CREATE A CONFIGURATION
========================================================= */

router.post(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const {
                listName,
                tabName,
                slug,
                templateId,
                templateName,
                templateSnapshot,
                masterListId,
            } = req.body;

            if (
                typeof listName !== "string" ||
                !listName.trim() ||
                typeof tabName !== "string" ||
                !tabName.trim() ||
                typeof slug !== "string" ||
                !slug.trim() ||
                typeof templateId !== "string" ||
                !templateId.trim() ||
                typeof templateName !== "string" ||
                !templateName.trim() ||
                !mongoose.isValidObjectId(masterListId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid form, template, and master-list details.",
                });
            }

            const normalizedSlug = slug
                .trim()
                .toLowerCase();

            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
                return res.status(400).json({
                    success: false,
                    message: "The public slug may contain only lowercase letters, numbers, and hyphens.",
                });
            }

            // Verify that the selected master list belongs to this organization.
            const masterList = await MasterList.findOne({
                _id: masterListId,
                organizationId: req.user.organizationId,
            });

            if (!masterList) {
                return res.status(404).json({
                    success: false,
                    message: "The selected master list was not found in your organization.",
                });
            }

            const config = await StudentFormConfig.create({
                organizationId: req.user.organizationId,
                createdBy: req.user._id,
                listName: listName.trim(),
                tabName: tabName.trim(),
                slug: normalizedSlug,
                templateId: templateId.trim(),
                templateName: templateName.trim(),
                templateSnapshot: templateSnapshot ?? null,
                masterListId: masterList._id,
                masterListName: masterList.listName,
                verification: {
                    status: "pending",
                    masterListId: masterList._id,
                },
            });

            return res.status(201).json({
                success: true,
                message: "Student form configuration created successfully.",
                config,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "This public URL slug is already in use. Please choose another tab name.",
                });
            }

            console.error(
                "Create student form configuration error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to create the student form.",
            });
        }
    }
);

/* =========================================================
   ADMIN: GET ONE CONFIGURATION
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
                    message: "Invalid student form configuration ID.",
                });
            }

            const config = await StudentFormConfig.findOne({
                _id: id,
                organizationId: req.user.organizationId,
            });

            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: "Student form configuration not found.",
                });
            }

            return res.json({
                success: true,
                config,
            });
        } catch (error) {
            console.error(
                "Fetch student form configuration error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to fetch the student form configuration.",
            });
        }
    }
);

export default router;