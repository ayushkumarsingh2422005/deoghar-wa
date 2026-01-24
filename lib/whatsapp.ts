/**
 * WhatsApp API utility functions for sending messages
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export interface WhatsAppMessage {
    to: string;
    text: string;
}

/**
 * Validate WhatsApp configuration
 */
function validateConfig() {
    console.log('🔍 Validating WhatsApp Configuration...');
    console.log(`   PHONE_NUMBER_ID: ${PHONE_NUMBER_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   ACCESS_TOKEN: ${ACCESS_TOKEN ? '✅ Set (length: ' + ACCESS_TOKEN.length + ')' : '❌ Missing'}`);

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        throw new Error('WhatsApp configuration is incomplete! Check WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local');
    }
}

/**
 * Send a text message to a WhatsApp user
 */
export async function sendWhatsAppMessage({ to, text }: WhatsAppMessage) {
    try {
        // Validate configuration first
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
                body: text,
            },
        };

        console.log('📤 WhatsApp API Request:');
        console.log(`   URL: ${url}`);
        console.log(`   To: ${to}`);
        console.log(`   Message: ${text}`);
        console.log(`   Payload:`, JSON.stringify(payload, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log('📥 WhatsApp API Response:');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('❌ WhatsApp API Error Response:', data);

            // Log specific error details
            if (data.error) {
                console.error(`   Error Code: ${data.error.code}`);
                console.error(`   Error Message: ${data.error.message}`);
                console.error(`   Error Type: ${data.error.type}`);
                if (data.error.error_data) {
                    console.error(`   Error Details:`, data.error.error_data);
                }
            }

            throw new Error(`WhatsApp API error (${response.status}): ${data.error?.message || JSON.stringify(data)}`);
        }

        console.log('✅ Message sent successfully!');
        console.log(`   Message ID: ${data.messages?.[0]?.id}`);

        return data;
    } catch (error) {
        console.error('❌ Critical error sending WhatsApp message:');
        if (error instanceof Error) {
            console.error(`   Error Name: ${error.name}`);
            console.error(`   Error Message: ${error.message}`);
            console.error(`   Stack Trace:`, error.stack);
        } else {
            console.error(`   Error:`, error);
        }
        throw error;
    }
}

/**
 * Generate a dummy auto-reply message based on the incoming message
 */
export function generateDummyReply(incomingMessage: string): string {
    const responses = [
        "Thank you for your message! Our team will get back to you shortly. 🙏",
        "Hello! We've received your message. Someone from our team will respond soon. 😊",
        "Thanks for reaching out! We're reviewing your message and will reply as soon as possible. ✅",
        "Hi there! Your message has been received. We'll be in touch soon! 👋",
        "Thank you for contacting us! Our team is here to help. We'll respond shortly. 💬",
    ];

    // Return a random response
    const selected = responses[Math.floor(Math.random() * responses.length)];
    console.log(`🎲 Generated dummy reply: "${selected}"`);
    return selected;
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string) {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        console.log(`👁️ Marking message ${messageId} as read...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('❌ Error marking message as read:', data);
            return false;
        }

        console.log('✅ Message marked as read');
        return true;
    } catch (error) {
        console.error('❌ Error marking message as read:', error);
        return false;
    }
}
