import mongoose, { Schema } from 'mongoose';
import { Analytics, UrlDocument } from '../types/url.interface';

const analyticsSchema = new Schema<Analytics>({
    ip: { type: String, required: true },
    country: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const urlSchema = new mongoose.Schema<UrlDocument>({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true },
    qrCodeUrl: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clicks: { type: Number, default: 0 },
    clickLimit: { type: Number },
    tags: { type: [String], default: [] },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    analytics: [analyticsSchema]
}, { timestamps: true });


export default mongoose.model<UrlDocument>('Url', urlSchema);