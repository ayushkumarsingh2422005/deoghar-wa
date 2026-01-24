import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import TrafficViolation from '@/models/TrafficViolation';

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

        const violation = await TrafficViolation.findByIdAndUpdate(id, data, { new: true });
        if (!violation) {
            return NextResponse.json({ error: 'Violation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, violation });
    } catch (error) {
        console.error('Error updating traffic violation:', error);
        return NextResponse.json({ error: 'Failed to update violation' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();
        const violation = await TrafficViolation.findByIdAndDelete(id);

        if (!violation) {
            return NextResponse.json({ error: 'Violation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting traffic violation:', error);
        return NextResponse.json({ error: 'Failed to delete violation' }, { status: 500 });
    }
}
