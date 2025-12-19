import mongoose, { Schema } from 'mongoose';
import { IContactMessage } from '../types/contactMessage.interface';

const ContactSchema = new Schema<IContactMessage>(
    {
        inquiryId: { type: String, unique: true, index: true },

        name: { type: String, required: true, trim: true },
        phoneNumber: { type: Number, required: true },
        email: { type: String, required: true, lowercase: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },

        ipAddress: { type: String },
        device: {
            type: String,
            enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
            default: 'Unknown'
        },
        platform: {
            type: String,
            enum: ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Unknown'],
            default: 'Unknown'
        },

        userAgent: { type: String },

        isRead: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'closed', 'pending'], default: 'active' },
    },
    { timestamps: true }
);


export default mongoose.model<IContactMessage>('ContactMessage', ContactSchema);