import mongoose, { Schema, Model, Document } from 'mongoose';

export type ComplaintType =
    | 'passport_delay'
    | 'passport_other'
    | 'character_delay'
    | 'character_other'
    | 'petition_not_visited'
    | 'petition_not_satisfied'
    | 'petition_other'
    | 'lost_mobile'
    | 'traffic_jam'
    | 'traffic_challan'
    | 'traffic_other'
    | 'cyber'
    | 'suggestion';

export interface IComplaint extends Document {
    phoneNumber: string;
    complaintType: ComplaintType;
    name: string;
    fatherName?: string;
    address?: string;
    applicationNumber?: string;
    policeStation?: string;
    location?: string;
    challanNumber?: string;
    lostMobileNumber?: string;
    remarks?: string;
    suggestion?: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        complaintType: {
            type: String,
            required: true,
            enum: [
                'passport_delay',
                'passport_other',
                'character_delay',
                'character_other',
                'petition_not_visited',
                'petition_not_satisfied',
                'petition_other',
                'lost_mobile',
                'traffic_jam',
                'traffic_challan',
                'traffic_other',
                'cyber',
                'suggestion',
            ],
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        fatherName: String,
        address: String,
        applicationNumber: String,
        policeStation: String,
        location: String,
        challanNumber: String,
        lostMobileNumber: String,
        remarks: String,
        suggestion: String,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved', 'closed'],
            default: 'pending',
        },
        assignedTo: String,
        resolvedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ComplaintSchema.index({ phoneNumber: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });

const Complaint: Model<IComplaint> =
    mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
