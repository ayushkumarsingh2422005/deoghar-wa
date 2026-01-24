import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import Contact from '@/models/Contact';
import { markMessageAsRead } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
}

// Handle incoming WhatsApp messages (POST request from Meta)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

        // WhatsApp sends webhook events in this structure
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            // Handle incoming messages
            if (value?.messages && value.messages.length > 0) {
                await connectDB();

                const message = value.messages[0];
                const phoneNumber = message.from;
                const messageId = message.id;

                // Check if this is a button response, list selection, or regular text
                const messageText = message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
                const buttonId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;

                console.log(`📥 Message from ${phoneNumber}: ${messageText}${buttonId ? ` (ID: ${buttonId})` : ''}`);

                // Save incoming message to database (only if there's text)
                if (messageText.trim()) {
                    await ChatMessage.create({
                        phoneNumber,
                        message: messageText,
                        direction: 'incoming',
                        messageId,
                        timestamp: new Date(parseInt(message.timestamp) * 1000),
                        status: 'delivered',
                    });
                }

                // Update or create contact
                await Contact.findOneAndUpdate(
                    { phoneNumber },
                    {
                        phoneNumber,
                        lastMessageAt: new Date(),
                        $inc: { unreadCount: 1 },
                    },
                    { upsert: true, new: true }
                );

                // ✅ SEND INTELLIGENT CHATBOT REPLY
                try {
                    // Process message through chatbot logic (pass buttonId if exists)
                    const { processChatbotMessage, sendChatbotResponse } = await import('@/lib/chatbot');
                    const botResponse = await processChatbotMessage(phoneNumber, messageText, buttonId);

                    console.log(`🤖 Sending chatbot reply to ${phoneNumber} (Type: ${botResponse.type})`);

                    // Send the response (either buttons or text)
                    const response = await sendChatbotResponse(phoneNumber, botResponse);

                    // Save the outgoing message to database
                    if (response?.messages?.[0]?.id) {
                        const outgoingText = botResponse.type === 'buttons' ? botResponse.bodyText : botResponse.message;
                        await ChatMessage.create({
                            phoneNumber,
                            message: outgoingText || '',
                            direction: 'outgoing',
                            messageId: response.messages[0].id,
                            timestamp: new Date(),
                            status: 'sent',
                        });
                        console.log(`✅ Chatbot reply sent successfully to ${phoneNumber}`);
                    }

                    // Mark the incoming message as read
                    await markMessageAsRead(messageId);
                } catch (replyError) {
                    console.error('❌ Error sending chatbot reply:', replyError);
                    // Don't throw - we still want to return 200 to WhatsApp
                }
            }

            // Handle message status updates (sent, delivered, read)
            if (value?.statuses && value.statuses.length > 0) {
                await connectDB();

                const status = value.statuses[0];
                console.log(`📊 Status update for message ${status.id}: ${status.status}`);

                await ChatMessage.findOneAndUpdate(
                    { messageId: status.id },
                    { status: status.status }
                );
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
