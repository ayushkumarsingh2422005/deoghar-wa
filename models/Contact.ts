import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IContact extends Document {
    phoneNumber: string;
    name?: string;
    language?: 'english' | 'hindi';
    lastMessageAt: Date;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        language: {
            type: String,
            enum: ['english', 'hindi'],
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        unreadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
