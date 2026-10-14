
import mongoose from "mongoose";

const masterListSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
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

        fields: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        records: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate tab names within the same organization.
masterListSchema.index(
    { organizationId: 1, tabName: 1 },
    { unique: true }
);

const MasterList = mongoose.model("MasterList", masterListSchema);

export default MasterList;
