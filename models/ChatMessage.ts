import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IChatMessage extends Document {
    phoneNumber: string;
    message: string;
    direction: 'incoming' | 'outgoing';
    messageId?: string;
    timestamp: Date;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        direction: {
            type: String,
            enum: ['incoming', 'outgoing'],
            required: true,
        },
        messageId: {
            type: String,
            sparse: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'failed'],
            default: 'sent',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
ChatMessageSchema.index({ phoneNumber: 1, timestamp: -1 });

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
