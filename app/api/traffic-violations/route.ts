import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import TrafficViolation from '@/models/TrafficViolation';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const violations = await TrafficViolation.find({}).sort({ section: 1 });
        return NextResponse.json({ success: true, violations });
    } catch (error) {
        console.error('Error fetching traffic violations:', error);
        return NextResponse.json({ error: 'Failed to fetch violations' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const violation = await TrafficViolation.create(data);
        return NextResponse.json({ success: true, violation });
    } catch (error) {
        console.error('Error creating traffic violation:', error);
        return NextResponse.json({ error: 'Failed to create violation' }, { status: 500 });
    }
}
