import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/notification.interface";

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },
        category: {
            type: String,
            enum: ["user", "url", "qr", "system", "settings"],
            default: "system",
        },
        read: { type: Boolean, default: false },
        forAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);