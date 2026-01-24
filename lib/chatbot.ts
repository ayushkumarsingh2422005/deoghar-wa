import Contact from '@/models/Contact';
import { sendInteractiveButtons, sendWhatsAppMessage, sendInteractiveList } from './whatsapp';

interface ChatbotResponse {
    type: 'text' | 'buttons' | 'list';
    message?: string;
    bodyText?: string;
    buttonText?: string;
    buttons?: Array<{ id: string; title: string }>;
    sections?: Array<{
        title?: string;
        rows: Array<{ id: string; title: string; description?: string }>;
    }>;
    language?: 'english' | 'hindi';
}

/**
 * Process incoming message and generate appropriate response
 */
export async function processChatbotMessage(
    phoneNumber: string,
    incomingMessage: string,
    interactiveId?: string
): Promise<ChatbotResponse> {
    // Check if this is an interactive response (button or list item)
    if (interactiveId) {
        // Language selection
        if (interactiveId === 'lang_english' || interactiveId === 'lang_hindi') {
            const language = interactiveId === 'lang_english' ? 'english' : 'hindi';

            await Contact.findOneAndUpdate(
                { phoneNumber },
                { language },
                { upsert: true }
            );

            // After language confirmation, show service menu
            return getServiceMenu(language);
        }

        // Service selection
        if (interactiveId.startsWith('service_')) {
            const contact = await Contact.findOne({ phoneNumber });
            const language = contact?.language || 'english';
            return handleServiceSelection(interactiveId, language);
        }
    }

    // Check if user is typing to switch language
    const message = incomingMessage.toLowerCase().trim();
    const languageSelection = detectLanguageSelection(message);

    if (languageSelection) {
        await Contact.findOneAndUpdate(
            { phoneNumber },
            { language: languageSelection },
            { upsert: true }
        );

        return getServiceMenu(languageSelection);
    }

    // Get user's current language preference
    const contact = await Contact.findOne({ phoneNumber });
    const userLanguage = contact?.language;

    // If no language set, send language selection buttons
    if (!userLanguage) {
        return {
            type: 'buttons',
            bodyText: `Welcome! Please select your preferred language:\n\nस्वागत है! कृपया अपनी पसंदीदा भाषा चुनें:`,
            buttons: [
                { id: 'lang_english', title: '🇬🇧 English' },
                { id: 'lang_hindi', title: '🇮🇳 हिंदी' },
            ],
        };
    }

    // Show service menu for any other message
    return getServiceMenu(userLanguage);
}

/**
 * Get service menu based on language
 */
function getServiceMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Select a Service*\n\nPlease choose from the following options:',
            buttonText: 'View Services',
            sections: [
                {
                    rows: [
                        { id: 'service_passport', title: 'Passport Issues', description: 'Passport related issues' },
                        { id: 'service_character', title: 'Character Verification', description: 'Character verification issues' },
                        { id: 'service_petition', title: 'SP Office Petition', description: 'Issues with petition to SP' },
                        { id: 'service_location', title: 'Location Service', description: 'Location based service' },
                        { id: 'service_lost_phone', title: 'Lost Mobile Phone', description: 'Report lost phone' },
                        { id: 'service_traffic', title: 'Traffic Issues', description: 'Traffic related issues' },
                        { id: 'service_cyber', title: 'Cyber Issues', description: 'Cyber crime related issues' },
                        { id: 'service_suggestion', title: 'Suggestions', description: 'Share your suggestions' },
                        { id: 'service_change_lang', title: '🔄 Change Language', description: 'Switch to Hindi' },
                    ],
                },
            ],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*सेवा चुनें*\n\nकृपया निम्नलिखित विकल्पों में से चुनें:',
            buttonText: 'सेवाएं देखें',
            sections: [
                {
                    rows: [
                        { id: 'service_passport', title: 'पासपोर्ट समस्याएं', description: 'पासपोर्ट संबंधी मुद्दे' },
                        { id: 'service_character', title: 'चरित्र सत्यापन', description: 'चरित्र सत्यापन संबंधी मुद्दे' },
                        { id: 'service_petition', title: 'एसपी कार्यालय याचिका', description: 'एसपी को प्रस्तुत याचिका से संबंधित मुद्दे' },
                        { id: 'service_location', title: 'स्थान सेवा', description: 'स्थान आधारित सेवा' },
                        { id: 'service_lost_phone', title: 'खोया मोबाइल फोन', description: 'खोया हुआ फोन रिपोर्ट करें' },
                        { id: 'service_traffic', title: 'यातायात समस्याएं', description: 'यातायात संबंधी मुद्दे' },
                        { id: 'service_cyber', title: 'साइबर समस्याएं', description: 'साइबर अपराध संबंधी मुद्दे' },
                        { id: 'service_suggestion', title: 'सुझाव', description: 'अपने सुझाव साझा करें' },
                        { id: 'service_change_lang', title: '🔄 भाषा बदलें', description: 'अंग्रेजी में बदलें' },
                    ],
                },
            ],
        };
    }
}

/**
 * Handle service selection
 */
function handleServiceSelection(serviceId: string, language: 'english' | 'hindi'): ChatbotResponse {
    // Language change
    if (serviceId === 'service_change_lang') {
        const newLanguage = language === 'english' ? 'hindi' : 'english';
        return {
            type: 'buttons',
            bodyText: language === 'english'
                ? 'Switch to Hindi?\n\nहिंदी में बदलें?'
                : 'Switch to English?\n\nअंग्रेजी में बदलें?',
            buttons: [
                { id: newLanguage === 'english' ? 'lang_english' : 'lang_hindi', title: newLanguage === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी' },
            ],
        };
    }

    const responses: Record<string, { english: string; hindi: string }> = {
        service_passport: {
            english: '📘 *Passport Issues*\n\nThank you for contacting us about passport-related issues.\n\nOur team will assist you shortly. Please provide details about your issue.',
            hindi: '📘 *पासपोर्ट समस्याएं*\n\nपासपोर्ट संबंधी समस्याओं के लिए हमसे संपर्क करने के लिए धन्यवाद।\n\nहमारी टीम जल्द ही आपकी सहायता करेगी। कृपया अपनी समस्या का विवरण दें।',
        },
        service_character: {
            english: '✅ *Character Verification*\n\nThank you for your query about character verification.\n\nPlease share the details and our team will help you.',
            hindi: '✅ *चरित्र सत्यापन*\n\nचरित्र सत्यापन के बारे में आपकी पूछताछ के लिए धन्यवाद।\n\nकृपया विवरण साझा करें और हमारी टीम आपकी मदद करेगी।',
        },
        service_petition: {
            english: '📋 *SP Office Petition*\n\nThank you for contacting us about your petition.\n\nPlease provide your petition details and we will assist you.',
            hindi: '📋 *एसपी कार्यालय याचिका*\n\nअपनी याचिका के बारे में हमसे संपर्क करने के लिए धन्यवाद।\n\nकृपया अपनी याचिका का विवरण दें और हम आपकी सहायता करेंगे।',
        },
        service_location: {
            english: '📍 *Location Based Service*\n\nThank you for using our location service.\n\nPlease share your location or describe your requirement.',
            hindi: '📍 *स्थान आधारित सेवा*\n\nहमारी स्थान सेवा का उपयोग करने के लिए धन्यवाद।\n\nकृपया अपना स्थान साझा करें या अपनी आवश्यकता का वर्णन करें।',
        },
        service_lost_phone: {
            english: '📱 *Lost Mobile Phone*\n\nWe will help you report your lost phone.\n\nPlease provide:\n- Your phone number\n- IMEI number (if available)\n- Date and location lost',
            hindi: '📱 *खोया मोबाइल फोन*\n\nहम आपके खोए हुए फोन की रिपोर्ट में मदद करेंगे।\n\nकृपया प्रदान करें:\n- आपका फोन नंबर\n- IMEI नंबर (यदि उपलब्ध हो)\n- तारीख और स्थान',
        },
        service_traffic: {
            english: '🚦 *Traffic Issues*\n\nThank you for reporting traffic issues.\n\nPlease describe the issue and location.',
            hindi: '🚦 *यातायात समस्याएं*\n\nयातायात समस्याओं की रिपोर्ट करने के लिए धन्यवाद।\n\nकृपया समस्या और स्थान का वर्णन करें।',
        },
        service_cyber: {
            english: '💻 *Cyber Crime*\n\nThank you for reporting cyber issues.\n\nPlease provide details about the incident.',
            hindi: '💻 *साइबर अपराध*\n\nसाइबर समस्याओं की रिपोर्ट करने के लिए धन्यवाद।\n\nकृपया घटना का विवरण दें।',
        },
        service_suggestion: {
            english: '💡 *Your Suggestions*\n\nWe value your feedback!\n\nPlease share your suggestions to help us improve our services.',
            hindi: '💡 *आपके सुझाव*\n\nहम आपकी प्रतिक्रिया की सराहना करते हैं!\n\nहमारी सेवाओं को बेहतर बनाने में मदद के लिए कृपया अपने सुझाव साझा करें।',
        },
    };

    const response = responses[serviceId];
    if (response) {
        return {
            type: 'text',
            message: response[language],
            language,
        };
    }

    // Default response
    return {
        type: 'text',
        message: language === 'english'
            ? 'Thank you! Our team will contact you shortly.'
            : 'धन्यवाद! हमारी टीम जल्द ही आपसे संपर्क करेगी।',
        language,
    };
}

/**
 * Send chatbot response to WhatsApp
 */
export async function sendChatbotResponse(
    phoneNumber: string,
    response: ChatbotResponse
) {
    if (response.type === 'buttons' && response.bodyText && response.buttons) {
        return await sendInteractiveButtons({
            to: phoneNumber,
            bodyText: response.bodyText,
            buttons: response.buttons,
        });
    } else if (response.type === 'list' && response.bodyText && response.buttonText && response.sections) {
        return await sendInteractiveList({
            to: phoneNumber,
            bodyText: response.bodyText,
            buttonText: response.buttonText,
            sections: response.sections,
        });
    } else if (response.type === 'text' && response.message) {
        return await sendWhatsAppMessage({
            to: phoneNumber,
            text: response.message,
        });
    }
}

/**
 * Detect if user is typing language selection keywords
 */
function detectLanguageSelection(message: string): 'english' | 'hindi' | null {
    const englishKeywords = ['english', 'eng'];
    const hindiKeywords = ['hindi', 'हिंदी', 'हिन्दी'];

    if (englishKeywords.some(keyword => message.includes(keyword))) {
        return 'english';
    }

    if (hindiKeywords.some(keyword => message.includes(keyword))) {
        return 'hindi';
    }

    return null;
}
