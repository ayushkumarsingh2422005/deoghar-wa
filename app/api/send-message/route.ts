import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import connectDB from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';

/**
 * API endpoint to send WhatsApp messages
 * POST /api/send-message
 * Body: { to: string, message: string }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: to, message' },
                { status: 400 }
            );
        }

        console.log(`\n📤 Sending message to ${to}...`);

        // Send the message via WhatsApp API
        const response = await sendWhatsAppMessage({
            to: to,
            text: message,
        });

        // Save the message to database
        if (response.messages?.[0]?.id) {
            await connectDB();

            const savedMessage = await ChatMessage.create({
                phoneNumber: to,
                message: message,
                direction: 'outgoing',
                messageId: response.messages[0].id,
                timestamp: new Date(),
                status: 'sent',
            });

            console.log(`✅ Message sent and saved to database`);

            return NextResponse.json({
                success: true,
                message: 'Message sent successfully',
                messageId: savedMessage._id.toString(),
                whatsappMessageId: response.messages[0].id,
            });
        } else {
            console.error('❌ WhatsApp API did not return message ID');
            return NextResponse.json(
                { error: 'Failed to send message - no message ID returned' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Error sending message:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send message',
                details: error instanceof Error ? error.stack : String(error),
            },
            { status: 500 }
        );
    }
}
