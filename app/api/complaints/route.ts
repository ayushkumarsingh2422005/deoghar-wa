import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        await connectDB();

        const query: Record<string, string> = {};
        if (status) query.status = status;
        if (type) query.complaintType = type;

        const complaints = await Complaint.find(query).sort({ createdAt: -1 }).limit(100);
        return NextResponse.json({ success: true, complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        await connectDB();

        const complaint = await Complaint.create(data);
        return NextResponse.json({ success: true, complaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
    }
}
