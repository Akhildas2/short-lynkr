import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true },
    qrCodeUrl: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date },
}, { timestamps: true });

// TTL index to auto-remove expired docs
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Url', urlSchema);