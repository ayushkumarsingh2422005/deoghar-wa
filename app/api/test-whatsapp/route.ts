import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import connectDB from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';

/**
 * Test endpoint to manually send a WhatsApp message
 * Usage: POST /api/test-whatsapp
 * Body: { "to": "919876543210", "message": "Test message" }
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

        console.log('\n=== 🧪 TEST WHATSAPP MESSAGE ===');
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        console.log('================================\n');

        // Send the message via WhatsApp API
        const response = await sendWhatsAppMessage({
            to: to,
            text: message,
        });

        // Save the message to database
        if (response.messages?.[0]?.id) {
            await connectDB();

            await ChatMessage.create({
                phoneNumber: to,
                message: message,
                direction: 'outgoing',
                messageId: response.messages[0].id,
                timestamp: new Date(),
                status: 'sent',
            });
        }

        console.log('\n=== ✅ TEST COMPLETED SUCCESSFULLY ===\n');

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            whatsappResponse: response,
        });
    } catch (error) {
        console.error('\n=== ❌ TEST FAILED ===');
        console.error(error);
        console.error('=====================\n');

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

/**
 * Get endpoint info
 */
export async function GET() {
    return NextResponse.json({
        message: 'WhatsApp Test Endpoint',
        usage: 'Send POST request with { "to": "phone_number", "message": "your message" }',
        example: {
            to: '919876543210',
            message: 'Hello from the test endpoint!',
        },
    });
}
