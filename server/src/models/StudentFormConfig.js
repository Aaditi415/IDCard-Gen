
import mongoose from "mongoose";

const studentFormConfigSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

        // Public URL identifier, for example: student-admissions
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        // Selected template identifier
        templateId: {
            type: String,
            required: true,
            trim: true,
        },

        templateName: {
            type: String,
            required: true,
            trim: true,
        },

        // Snapshot of the selected template
        templateSnapshot: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Actual fields used by the public student form
        formFields: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        // Associated master list
        masterListId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MasterList",
            required: true,
        },

        masterListName: {
            type: String,
            required: true,
            trim: true,
        },

        // Verification configuration
        verification: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },

            masterListId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MasterList",
                required: true,
            },
        },

        // Enable or disable the public student form
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Public slugs must be unique across organizations
studentFormConfigSchema.index(
    { slug: 1 },
    { unique: true }
);

// Efficient organization-level listing
studentFormConfigSchema.index({
    organizationId: 1,
    updatedAt: -1,
});

const StudentFormConfig = mongoose.model(
    "StudentFormConfig",
    studentFormConfigSchema
);

export default StudentFormConfig;
