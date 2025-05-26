import mongoose from 'mongoose';
import { UrlDocument } from '../types/url.interface';

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
}, { timestamps: true });

// TTL index to auto-remove expired docs
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<UrlDocument>('Url', urlSchema);