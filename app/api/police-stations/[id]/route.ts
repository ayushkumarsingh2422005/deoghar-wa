import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import PoliceStation from '@/models/PoliceStation';

export async function GET(
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
        const station = await PoliceStation.findById(id);

        if (!station) {
            return NextResponse.json({ error: 'Station not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, station });
    } catch (error) {
        console.error('Error fetching police station:', error);
        return NextResponse.json({ error: 'Failed to fetch station' }, { status: 500 });
    }
}

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

        const station = await PoliceStation.findByIdAndUpdate(
            id,
            {
                name: data.name,
                nameHindi: data.nameHindi,
                address: data.address,
                addressHindi: data.addressHindi,
                district: data.district,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
                },
                contactNumber: data.contactNumber,
                inchargeName: data.inchargeName,
                inchargeNameHindi: data.inchargeNameHindi,
                isActive: data.isActive,
            },
            { new: true }
        );

        if (!station) {
            return NextResponse.json({ error: 'Station not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, station });
    } catch (error) {
        console.error('Error updating police station:', error);
        return NextResponse.json({ error: 'Failed to update station' }, { status: 500 });
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
        const station = await PoliceStation.findByIdAndDelete(id);

        if (!station) {
            return NextResponse.json({ error: 'Station not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting police station:', error);
        return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 });
    }
}
