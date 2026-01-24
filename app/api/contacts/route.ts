import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const contacts = await Contact.find({})
            .sort({ lastMessageAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            contacts: contacts.map(contact => ({
                ...contact,
                _id: contact._id.toString(),
            })),
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}
