import mongoose, { Schema } from "mongoose";
import { QrCodeDocument } from "../types/qrCode.interface";

const qrCodeSchema = new Schema<QrCodeDocument>({
    urlId: { type: Schema.Types.ObjectId, ref: 'Url', required: true },
    qrCodeUrl: { type: String, required: true },
    format: { type: String, enum: ['PNG', 'SVG', 'JPEG'], default: 'PNG' },
    size: { type: Number, default: 300 },
    foregroundColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#FFFFFF' },
}, { timestamps: true });

export default mongoose.model<QrCodeDocument>('QrCode', qrCodeSchema)