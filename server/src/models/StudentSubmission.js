
import mongoose from "mongoose";

const studentSubmissionSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        studentFormConfigId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudentFormConfig",
            required: true,
            index: true,
        },

        masterListId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MasterList",
            required: true,
        },

        listName: {
            type: String,
            required: true,
            trim: true,
        },

        tabName: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        templateId: {
            type: String,
            default: "",
        },

        templateName: {
            type: String,
            default: "",
        },

        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            default: {},
        },

        verification: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },
            matched: {
                type: Boolean,
                default: false,
            },
            checkedFields: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            issues: {
                type: [String],
                default: [],
            },
            checkedAt: {
                type: Date,
                default: null,
            },
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const StudentSubmission = mongoose.model(
    "StudentSubmission",
    studentSubmissionSchema
);

export default StudentSubmission;
