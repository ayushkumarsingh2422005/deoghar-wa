import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';

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

        const resource = await Resource.findByIdAndUpdate(id, data, { new: true });
        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, resource });
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
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
        const resource = await Resource.findByIdAndDelete(id);

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }
}
