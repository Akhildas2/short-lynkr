import mongoose, { Schema } from 'mongoose';
import { Analytics, UrlDocument } from '../types/url.interface';

const analyticsSchema = new Schema<Analytics>({
    ip: { type: String, required: true },
    country: { type: String, required: true },
    region: { type: String },
    city: { type: String },
    timezone: { type: String },
    ll: { type: [Number] },
    userAgent: { type: String },
    referrer: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    timestamp: { type: Date, default: Date.now },
});

const urlSchema = new mongoose.Schema<UrlDocument>({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    qrCode: { type: Schema.Types.ObjectId, ref: 'QrCode' },
    clicks: { type: Number, default: 0 },
    clickLimit: { type: Number },
    tags: { type: [String], default: [] },
    expiresAt: { type: Date },
    analytics: [analyticsSchema],
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null }
}, { timestamps: true });


export default mongoose.model<UrlDocument>('Url', urlSchema);