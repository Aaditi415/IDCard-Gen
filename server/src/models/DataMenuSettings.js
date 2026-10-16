
import mongoose from "mongoose";

const dataMenuSettingsSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },

        listOrder: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "DataMenuSettings",
    dataMenuSettingsSchema
);
