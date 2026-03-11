import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        await connectDB();

        const query: Record<string, string> = {};
        if (type) query.type = type;

        const resources = await Resource.find(query).sort({ order: 1, createdAt: -1 });
        return NextResponse.json({ success: true, resources });
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
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

        const resource = await Resource.create(data);
        return NextResponse.json({ success: true, resource });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
    }
}
