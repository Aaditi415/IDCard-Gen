
import express from "express";
import mongoose from "mongoose";

import authenticate, {
    authorizeRoles,
} from "../middleware/auth.js";

import StudentFormConfig from "../models/StudentFormConfig.js";
import StudentSubmission from "../models/StudentSubmission.js";
import MasterList from "../models/MasterList.js";

const router = express.Router();

/* =========================================================
   NORMALIZE KEYS AND VALUES
========================================================= */

const normalizeKey = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";

    let text = String(value).trim();

    // DD/MM/YYYY -> YYYY-MM-DD
    let match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (match) {
        text = `${match[3]}-${match[2]}-${match[1]}`;
    }

    // DD-MM-YYYY -> YYYY-MM-DD
    match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (match) {
        text = `${match[3]}-${match[2]}-${match[1]}`;
    }

    return text.toLowerCase();
};

/* =========================================================
   MASTER COLUMN NAME
========================================================= */

const getColumnName = (column, index) => {
    if (typeof column === "string") {
        return column.trim();
    }

    if (column && typeof column === "object") {
        return String(
            column.name ||
            column.label ||
            column.key ||
            `Column ${index + 1}`
        ).trim();
    }

    return `Column ${index + 1}`;
};

/* =========================================================
   FIELD ALIASES

   Generic "Number" and "Date" are supported for your current
   form only when they mean Member No and DOB respectively.
========================================================= */

const aliases = {
    name: [
        "name",
        "studentname",
        "fullname",
        "applicantname",
    ],

    memberno: [
        "memberno",
        "membernumber",
        "studentid",
        "studentnumber",
        "memberid",
        "id",
        "number",
    ],

    studentid: [
        "studentid",
        "studentnumber",
        "memberno",
        "membernumber",
        "memberid",
        "id",
    ],

    dob: [
        "dob",
        "dateofbirth",
        "birthdate",
        "date",
    ],

    dateofbirth: [
        "dateofbirth",
        "dob",
        "birthdate",
        "date",
    ],

    rollnumber: [
        "rollnumber",
        "rollno",
        "roll",
    ],

    rollno: [
        "rollno",
        "rollnumber",
        "roll",
    ],
};

const getFieldAliases = (field) =>
    [
        field?.id,
        field?.name,
        field?.label,
    ]
        .filter(Boolean)
        .map(normalizeKey);

/* =========================================================
   FIND SUBMITTED VALUE FOR A MASTER COLUMN
========================================================= */

const findSubmissionValue = (columnName, fields, data) => {
    const columnKey = normalizeKey(columnName);

    const acceptableKeys = new Set([
        columnKey,
        ...(aliases[columnKey] || []),
    ]);

    // First: look for an exact key in submitted data.
    const directKey = Object.keys(data || {}).find((key) =>
        acceptableKeys.has(normalizeKey(key))
    );

    if (directKey !== undefined) {
        return {
            found: true,
            value: data[directKey],
        };
    }

    // Next: identify the matching saved form field.
    const matchingFields = (fields || []).filter((field) => {
        const keys = getFieldAliases(field);

        return keys.some((key) => {
            if (acceptableKeys.has(key)) {
                return true;
            }

            const fieldAliases = aliases[key] || [];

            return fieldAliases.some((alias) =>
                acceptableKeys.has(alias)
            );
        });
    });

    // Do not guess if multiple fields match the same column.
    if (matchingFields.length !== 1) {
        return {
            found: false,
            value: undefined,
        };
    }

    const field = matchingFields[0];

    for (const key of [
        field.id,
        field.name,
        field.label,
    ]) {
        if (
            key &&
            Object.prototype.hasOwnProperty.call(data || {}, key)
        ) {
            return {
                found: true,
                value: data[key],
            };
        }
    }

    return {
        found: false,
        value: undefined,
    };
};

/* =========================================================
   VERIFY SUBMISSION AGAINST MASTER LIST
========================================================= */

const verifySubmission = async (config, data) => {
    const masterList = await MasterList.findOne({
        _id: config.masterListId,
        organizationId: config.organizationId,
    }).lean();

    if (!masterList) {
        return {
            status: "pending",
            matched: false,
            checkedFields: {},
            issues: [
                "The associated Master List could not be found.",
            ],
            checkedAt: new Date(),
        };
    }

    const columns = masterList.fields || [];
    const records = masterList.records || [];

    // Use the actual fields saved with the form configuration.
    // Fall back to older template snapshots for compatibility.
    const formFields =
        config.formFields?.length
            ? config.formFields
            : config.templateSnapshot?.form?.fields || [];

    if (!columns.length || !records.length) {
        return {
            status: "pending",
            matched: false,
            checkedFields: {},
            issues: [
                "The Master List has no fields or records to verify.",
            ],
            checkedAt: new Date(),
        };
    }

    if (!formFields.length) {
        return {
            status: "pending",
            matched: false,
            checkedFields: {},
            issues: [
                "The saved student form fields are missing. Recreate the student form configuration.",
            ],
            checkedAt: new Date(),
        };
    }

    // Resolve each Master List column to one submitted value.
    const comparisons = columns.map((column, index) => {
        const columnName = getColumnName(column, index);

        const result = findSubmissionValue(
            columnName,
            formFields,
            data
        );

        return {
            index,
            columnName,
            ...result,
        };
    });

    const missingColumns = comparisons
        .filter((item) => !item.found)
        .map((item) => item.columnName);

    // Never approve if a required Master List column cannot be mapped.
    if (missingColumns.length) {
        return {
            status: "pending",
            matched: false,
            checkedFields: {},
            issues: [
                `Unable to identify submitted values for: ${missingColumns.join(", ")}. Check the student form field names and labels.`,
            ],
            checkedAt: new Date(),
        };
    }

    // Find one row where every Master List column matches.
    const matchingRecord = records.find((record) =>
        comparisons.every((comparison) => {
            const masterValue = Array.isArray(record)
                ? record[comparison.index]
                : record?.[comparison.columnName];

            const submittedValue = comparison.value;

            return (
                normalizeValue(masterValue) !== "" &&
                normalizeValue(submittedValue) !== "" &&
                normalizeValue(masterValue) ===
                    normalizeValue(submittedValue)
            );
        })
    );

    const checkedFields = {};

    if (!matchingRecord) {
        const firstRecord = records[0];

        for (const comparison of comparisons) {
            const masterValue = Array.isArray(firstRecord)
                ? firstRecord[comparison.index]
                : firstRecord?.[comparison.columnName];

            checkedFields[comparison.columnName] = {
                submitted: comparison.value ?? "",
                masterValue: masterValue ?? "",
                matched:
                    normalizeValue(masterValue) !== "" &&
                    normalizeValue(comparison.value) !== "" &&
                    normalizeValue(masterValue) ===
                        normalizeValue(comparison.value),
            };
        }

        return {
            status: "rejected",
            matched: false,
            checkedFields,
            issues: [
                "Student details do not match any single record in the Master List.",
            ],
            checkedAt: new Date(),
        };
    }

    // Record the details of the actual matching row.
    for (const comparison of comparisons) {
        const masterValue = Array.isArray(matchingRecord)
            ? matchingRecord[comparison.index]
            : matchingRecord?.[comparison.columnName];

        checkedFields[comparison.columnName] = {
            submitted: comparison.value,
            masterValue,
            matched: true,
        };
    }

    return {
        status: "approved",
        matched: true,
        checkedFields,
        issues: [
            "All Master List columns match a single record.",
        ],
        checkedAt: new Date(),
    };
};

/* =========================================================
   FORMAT SUBMISSION
========================================================= */

const formatSubmission = (submission) => {
    const item = submission.toObject
        ? submission.toObject()
        : submission;

    return {
        ...item,
        id: String(item._id),
        status: item.verification?.status || "pending",
    };
};

/* =========================================================
   PUBLIC STUDENT SUBMISSION
   POST /api/student-submissions/public/:slug
========================================================= */

router.post("/public/:slug", async (req, res) => {
    try {
        const slug = String(req.params.slug || "")
            .trim()
            .toLowerCase();

        const { data } = req.body;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Student form slug is required.",
            });
        }

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid student form data is required.",
            });
        }

        const config = await StudentFormConfig.findOne({
            slug,
            isActive: true,
        }).lean();

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Student form not found or inactive.",
            });
        }

        if (!config.organizationId || !config.masterListId) {
            return res.status(400).json({
                success: false,
                message: "Student form configuration is incomplete.",
            });
        }

        const verification = await verifySubmission(config, data);

        const submission = await StudentSubmission.create({
            organizationId: config.organizationId,
            studentFormConfigId: config._id,
            masterListId: config.masterListId,
            listName: config.listName,
            tabName: config.tabName,
            slug: config.slug,
            templateId: config.templateId || "",
            templateName: config.templateName || "",
            data,
            verification,
        });

        return res.status(201).json({
            success: true,
            message: "Student submission saved and verified.",
            submission: formatSubmission(submission),
        });
    } catch (error) {
        console.error("Student submission error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save student submission.",
        });
    }
});

/* =========================================================
   GET STUDENT SUBMISSIONS
   GET /api/student-submissions
========================================================= */

router.get(
    "/",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const filter = {
                organizationId: req.user.organizationId,
            };

            const { masterListId } = req.query;

            if (masterListId) {
                if (!mongoose.isValidObjectId(masterListId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid master list ID.",
                    });
                }

                filter.masterListId = masterListId;
            }

            const submissions = await StudentSubmission.find(filter)
                .sort({ submittedAt: -1 })
                .lean();

            return res.json({
                success: true,
                submissions: submissions.map(formatSubmission),
            });
        } catch (error) {
            console.error("Fetch student submissions error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch student submissions.",
            });
        }
    }
);

/* =========================================================
   UPDATE STUDENT SUBMISSION
   PATCH /api/student-submissions/:id
========================================================= */

router.patch(
    "/:id",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { data, status } = req.body;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid submission ID.",
                });
            }

            const submission = await StudentSubmission.findOne({
                _id: id,
                organizationId: req.user.organizationId,
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: "Student submission not found.",
                });
            }

            if (status !== undefined && data === undefined) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status is determined by server-side verification. Submit updated data to re-verify.",
                });
            }

            if (data !== undefined) {
                if (
                    !data ||
                    typeof data !== "object" ||
                    Array.isArray(data)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Valid student data is required.",
                    });
                }

                const config = await StudentFormConfig.findOne({
                    _id: submission.studentFormConfigId,
                    organizationId: req.user.organizationId,
                }).lean();

                if (!config) {
                    return res.status(404).json({
                        success: false,
                        message: "Student form configuration not found.",
                    });
                }

                submission.data = data;
                submission.verification = await verifySubmission(
                    config,
                    data
                );

                await submission.save();
            }

            return res.json({
                success: true,
                message: "Student submission updated and verified.",
                submission: formatSubmission(submission),
            });
        } catch (error) {
            console.error("Update student submission error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update student submission.",
            });
        }
    }
);

/* =========================================================
   DELETE STUDENT SUBMISSION
   DELETE /api/student-submissions/:id
========================================================= */


/* =========================================================
   FLUSH ALL ORGANIZATION DATA
   DELETE /api/student-submissions/flush-all

   IMPORTANT: Keep this route before /:id
========================================================= */

router.delete(
    "/flush-all",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const organizationId = req.user.organizationId;

            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: "Organization access could not be verified.",
                });
            }

            const [submissions, forms, masterLists] =
                await Promise.all([
                    StudentSubmission.deleteMany({ organizationId }),
                    StudentFormConfig.deleteMany({ organizationId }),
                    MasterList.deleteMany({ organizationId }),
                ]);

            return res.json({
                success: true,
                message: "Organization data cleared successfully.",
                deleted: {
                    submissions: submissions.deletedCount,
                    formConfigurations: forms.deletedCount,
                    masterLists: masterLists.deletedCount,
                },
            });
        } catch (error) {
            console.error("Flush organization data error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to clear organization data.",
            });
        }
    }
);

/* =========================================================
   DELETE ONE STUDENT SUBMISSION
   DELETE /api/student-submissions/:id
========================================================= */

router.delete(
    "/:id",
    authenticate,
    authorizeRoles("orgadmin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid submission ID.",
                });
            }

            const deletedSubmission =
                await StudentSubmission.findOneAndDelete({
                    _id: id,
                    organizationId: req.user.organizationId,
                });

            if (!deletedSubmission) {
                return res.status(404).json({
                    success: false,
                    message: "Student submission not found.",
                });
            }

            return res.json({
                success: true,
                message: "Student submission deleted successfully.",
            });
        } catch (error) {
            console.error("Delete student submission error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to delete student submission.",
            });
        }
    }
);

export default router;
