import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        await connectDB();

        const updateData: Record<string, string> = { status: data.status };
        if (data.assignedTo) updateData.assignedTo = data.assignedTo;
        if (data.status === 'resolved') updateData.resolvedAt = new Date().toISOString();

        const complaint = await Complaint.findByIdAndUpdate(id, updateData, { new: true });
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, complaint });
    } catch (error) {
        console.error('Error updating complaint:', error);
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}
