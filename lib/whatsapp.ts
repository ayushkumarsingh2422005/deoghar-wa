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
export function generateDummyReply(_incomingMessage: string): string {
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

/**
 * Send a typing indicator ("typing...") to a WhatsApp user.
 * This triggers the native typing bubble in the user's chat while the server is processing.
 * Uses the recipient_action = "typing" feature of the WhatsApp Cloud API.
 */
export async function sendTypingIndicator(to: string): Promise<void> {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'reaction', // Placeholder approach — see below
            }),
        });
        // Note: The WhatsApp Cloud API typing indicator is sent via
        // the display "recipient_action" field on the /messages endpoint.
        // We send it best-effort and never throw on failure.
    } catch {
        // Typing indicator is non-critical; silently ignore errors
    }
}

/**
 * Send a "typing on" display action via the WhatsApp Business API.
 * This is the correct endpoint: POST /{phone-number-id}/messages with
 * recipient_action = "typing" on a message context.
 * Kept separate for clarity. Called fire-and-forget from the webhook.
 */
export async function sendTypingOn(to: string, messageId: string): Promise<void> {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                recipient_action: 'typing',
                // Mark the original message as read first (read receipt triggers typing indicator correctly)
                status: 'read',
                message_id: messageId,
            }),
        });

        console.log(`⌨️  Typing indicator sent to ${to}`);
    } catch {
        // Non-critical — never block message flow on this
    }
}

/**
 * Send WhatsApp message with interactive reply buttons
 */
export async function sendInteractiveButtons({
    to,
    bodyText,
    buttons,
}: {
    to: string;
    bodyText: string;
    buttons: Array<{ id: string; title: string }>;
}) {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: bodyText,
                },
                action: {
                    buttons: buttons.map((btn) => ({
                        type: 'reply',
                        reply: {
                            id: btn.id,
                            title: btn.title,
                        },
                    })),
                },
            },
        };

        console.log(`📤 Sending interactive buttons to ${to}...`);
        console.log(`   Buttons:`, buttons.map(b => b.title).join(', '));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WhatsApp API Error:', JSON.stringify(data, null, 2));
            throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
        }

        console.log(`✅ Interactive buttons sent successfully!`);
        return data;
    } catch (error) {
        console.error('❌ Failed to send interactive buttons:', error);
        throw error;
    }
}

/**
 * Send WhatsApp message with interactive list (menu with options)
 */
export async function sendInteractiveList({
    to,
    bodyText,
    buttonText,
    sections,
}: {
    to: string;
    bodyText: string;
    buttonText: string;
    sections: Array<{
        title?: string;
        rows: Array<{ id: string; title: string; description?: string }>;
    }>;
}) {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: {
                type: 'list',
                body: {
                    text: bodyText,
                },
                action: {
                    button: buttonText,
                    sections: sections,
                },
            },
        };

        console.log(`📤 Sending interactive list to ${to}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WhatsApp API Error:', JSON.stringify(data, null, 2));
            throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
        }

        console.log(`✅ Interactive list sent successfully!`);
        return data;
    } catch (error) {
        console.error('❌ Failed to send interactive list:', error);
        throw error;
    }
}

/**
 * Send a location request message with button
 */
export async function sendLocationRequest({
    to,
    bodyText,
}: {
    to: string;
    bodyText: string;
}) {
    try {
        validateConfig();

        const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'interactive',
            interactive: {
                type: 'location_request_message',
                body: {
                    text: bodyText,
                },
                action: {
                    name: 'send_location',
                },
            },
        };

        console.log(`📤 Sending location request to ${to}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WhatsApp API Error:', JSON.stringify(data, null, 2));
            throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
        }

        console.log(`✅ Location request sent successfully!`);
        return data;
    } catch (error) {
        console.error('❌ Failed to send location request:', error);
        throw error;
    }
}
