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
    | 'lost_mobile_not_satisfied'
    | 'traffic_jam'
    | 'traffic_challan'
    | 'traffic_other'
    | 'cyber'
    | 'cyber_other'
    | 'suggestion';

export interface IComplaint extends Document {
    complaintId: string;
    phoneNumber: string;
    complaintType: ComplaintType;
    name: string;
    fatherName?: string;
    address?: string;
    applicationNumber?: string;
    applicationDate?: string;
    policeStation?: string;
    location?: string;
    challanNumber?: string;
    lostMobileNumber?: string;
    remarks?: string;
    suggestion?: string;
    status: 'pending' | 'in_progress' | 'resolved';
    assignedTo?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
    {
        complaintId: {
            type: String,
            unique: true,
            sparse: true,
        },
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
                'lost_mobile_not_satisfied',
                'traffic_jam',
                'traffic_challan',
                'traffic_other',
                'cyber',
                'cyber_other',
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
        applicationDate: String,
        policeStation: String,
        location: String,
        challanNumber: String,
        lostMobileNumber: String,
        remarks: String,
        suggestion: String,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved'],
            default: 'pending',
        },
        assignedTo: String,
        resolvedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Auto-generate a human-readable complaint ID before saving a new document
ComplaintSchema.pre('save', async function () {
    if (this.isNew && !this.complaintId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Complaint').countDocuments({});
        const serial = String(count + 1).padStart(5, '0');
        this.complaintId = `DGH-${year}-${serial}`;
    }
});

// Indexes for faster queries
ComplaintSchema.index({ phoneNumber: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ complaintType: 1, createdAt: -1 });

const Complaint: Model<IComplaint> =
    mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
