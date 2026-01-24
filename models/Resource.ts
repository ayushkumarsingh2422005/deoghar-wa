import mongoose, { Schema, Model, Document } from 'mongoose';

export type ResourceType =
    | 'important_link'
    | 'disclaimer'
    | 'cyber_info'
    | 'traffic_info'
    | 'general_info';

export interface IResource extends Document {
    type: ResourceType;
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    url?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
    {
        type: {
            type: String,
            required: true,
            enum: ['important_link', 'disclaimer', 'cyber_info', 'traffic_info', 'general_info'],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        titleHindi: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        contentHindi: {
            type: String,
            required: true,
        },
        url: String,
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for ordering
ResourceSchema.index({ type: 1, order: 1 });

const Resource: Model<IResource> =
    mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
