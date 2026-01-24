import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITrafficViolation extends Document {
    crime: string;
    crimeHindi: string;
    section: string;
    penalty: number;
    description?: string;
    descriptionHindi?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficViolationSchema = new Schema<ITrafficViolation>(
    {
        crime: {
            type: String,
            required: true,
            trim: true,
        },
        crimeHindi: {
            type: String,
            required: true,
            trim: true,
        },
        section: {
            type: String,
            required: true,
        },
        penalty: {
            type: Number,
            required: true,
        },
        description: String,
        descriptionHindi: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const TrafficViolation: Model<ITrafficViolation> =
    mongoose.models.TrafficViolation || mongoose.model<ITrafficViolation>('TrafficViolation', TrafficViolationSchema);

export default TrafficViolation;
