import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import PoliceStation from '@/models/PoliceStation';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const stations = await PoliceStation.find({}).sort({ name: 1 });
        return NextResponse.json({ success: true, stations });
    } catch (error) {
        console.error('Error fetching police stations:', error);
        return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
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

        const station = await PoliceStation.create({
            name: data.name,
            nameHindi: data.nameHindi,
            address: data.address,
            addressHindi: data.addressHindi,
            district: data.district || 'Deoghar',
            location: {
                type: 'Point',
                coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
            },
            contactNumber: data.contactNumber,
            inchargeName: data.inchargeName,
            inchargeNameHindi: data.inchargeNameHindi,
            isActive: data.isActive !== false,
        });

        return NextResponse.json({ success: true, station });
    } catch (error) {
        console.error('Error creating police station:', error);
        return NextResponse.json({ error: 'Failed to create station' }, { status: 500 });
    }
}
