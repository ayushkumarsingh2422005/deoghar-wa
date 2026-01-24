import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPoliceStation extends Document {
    name: string;
    nameHindi: string;
    address: string;
    addressHindi: string;
    district: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    contactNumber: string;
    inchargeName?: string;
    inchargeNameHindi?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PoliceStationSchema = new Schema<IPoliceStation>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        nameHindi: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        addressHindi: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
            default: 'Deoghar',
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        contactNumber: {
            type: String,
            required: true,
        },
        inchargeName: String,
        inchargeNameHindi: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create 2dsphere index for location-based queries
PoliceStationSchema.index({ location: '2dsphere' });

const PoliceStation: Model<IPoliceStation> =
    mongoose.models.PoliceStation || mongoose.model<IPoliceStation>('PoliceStation', PoliceStationSchema);

export default PoliceStation;
