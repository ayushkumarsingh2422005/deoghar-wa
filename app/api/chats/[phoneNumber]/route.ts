import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import Contact from '@/models/Contact';
import { getSession } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ phoneNumber: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Await params in Next.js 15+
        const { phoneNumber } = await params;

        console.log(`📱 Fetching messages for ${phoneNumber}...`);

        const messages = await ChatMessage.find({ phoneNumber })
            .sort({ timestamp: 1 })
            .lean();

        console.log(`✅ Found ${messages.length} messages for ${phoneNumber}`);

        // Mark messages as read by resetting unread count
        await Contact.findOneAndUpdate(
            { phoneNumber },
            { unreadCount: 0 }
        );

        return NextResponse.json({
            success: true,
            messages: messages.map(msg => ({
                ...msg,
                _id: msg._id.toString(),
            })),
        });
    } catch (error) {
        console.error('❌ Error fetching chat messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
