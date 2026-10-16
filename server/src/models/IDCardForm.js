
import mongoose from "mongoose";

const idCardFormSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        fields: {
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

idCardFormSchema.index({ organizationId: 1, name: 1 });

const IDCardForm = mongoose.model("IDCardForm", idCardFormSchema);

export default IDCardForm;
