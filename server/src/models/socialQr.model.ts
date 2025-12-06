import mongoose, { Schema } from "mongoose";
import { SocialQrCodeDocument } from "../types/socialQr.interface";

const socialQrSchema = new Schema<SocialQrCodeDocument>({
    platform: { type: String, required: true },
    accountUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    qrCodeUrl: { type: String, required: true },
    format: { type: String, enum: ["PNG", "SVG", "JPEG"], default: "PNG" },
    size: { type: Number, default: 300 },
    foregroundColor: { type: String, default: "#000000" },
    backgroundColor: { type: String, default: "#FFFFFF" },
}, { timestamps: true });

export default mongoose.model<SocialQrCodeDocument>("SocialQrCode", socialQrSchema);