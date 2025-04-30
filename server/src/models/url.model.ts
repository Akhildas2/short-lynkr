import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true },
    qrCodeUrl: { type: String },
    date: { type: Date, default: Date.now },
});

export default mongoose.model('Url', urlSchema);