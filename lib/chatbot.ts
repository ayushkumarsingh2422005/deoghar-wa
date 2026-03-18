import Contact from '@/models/Contact';
import PoliceStation from '@/models/PoliceStation';
import TrafficViolation from '@/models/TrafficViolation';
import connectDB from './db';
import { sendInteractiveButtons, sendWhatsAppMessage, sendInteractiveList } from './whatsapp';
import { handleFormSubmission } from './chatbot-helpers';

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
    /**
     * When true, the webhook will automatically send the service menu
     * after this response, signalling that a cycle has completed.
     */
    sendFollowUpMenu?: boolean;
}

// Store user flow state in memory (in production, use Redis or database)
const userFlowState: Record<string, { step: string; data?: Record<string, unknown> }> = {};

/**
 * Process incoming message and generate appropriate response
 */
export async function processChatbotMessage(
    phoneNumber: string,
    incomingMessage: string,
    interactiveId?: string
): Promise<ChatbotResponse> {
    await connectDB();

    // Check if this is an interactive response
    if (interactiveId) {
        return await handleInteractiveResponse(phoneNumber, interactiveId);
    }

    // ── LANGUAGE GATE (must come first) ──────────────────────────────────────
    // Before doing anything else, check whether the user has picked a language.
    // This ensures that even "hi" / "hello" / "menu" from a brand-new user
    // will always show the language selection prompt.
    const normalizedMessage = incomingMessage.toLowerCase().trim();

    // Allow language-keyword shortcuts at any point (before gate check so they
    // can still switch language by typing "english" / "hindi").
    const languageSelection = detectLanguageSelection(normalizedMessage);
    if (languageSelection) {
        await Contact.findOneAndUpdate(
            { phoneNumber },
            { language: languageSelection },
            { upsert: true }
        );
        return await showDisclaimerAndContacts(phoneNumber, languageSelection);
    }

    // Fetch the contact once; re-used below.
    const contact = await Contact.findOne({ phoneNumber });
    const userLanguage = contact?.language;

    const greetingKeywords = ['hi', 'hello', 'hii', 'hey', 'start', 'test'];
    const isGreeting = greetingKeywords.some(kw => normalizedMessage.includes(kw));
    
    // If no language is set yet, or user typed a greeting, show the welcome + language selection prompt.
    if (!userLanguage || isGreeting) {
        if (userFlowState[phoneNumber]) {
            delete userFlowState[phoneNumber];
        }
        return {
            type: 'buttons',
            bodyText: `*Welcome to Deoghar Police Official WhatsApp Chatbot*\n*देवघर पुलिस आधिकारिक व्हाट्सएप चैटबॉट में आपका स्वागत है*\n\n🚨 *Important Contacts / महत्वपूर्ण नंबर:*\n📞 Emergency / आपातकाल: 112\n📞 District Control Room: +919241821642\n📞 Cyber Crime / साइबर अपराध: 1930\n📞 Cyber Police Station: +919241821643\n📞 Traffic Police Station: +919296811585\n\nPlease select your official language:\nकृपया अपनी आधिकारिक भाषा चुनें:`,
            buttons: [
                { id: 'lang_english', title: '🇬🇧 English' },
                { id: 'lang_hindi', title: '🇮🇳 हिंदी' },
            ],
        };
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Check for exit/menu keywords to break any loop (only for users who
    // already have a language selected).
    const exitKeywords = ['menu', 'cancel', 'exit', 'stop', 'main menu', 'help', 'menue'];
    if (exitKeywords.includes(normalizedMessage)) {
        // Clear any existing flow state
        if (userFlowState[phoneNumber]) {
            delete userFlowState[phoneNumber];
        }
        return getServiceMenu(userLanguage);
    }

    // Check if user is in a form flow (waiting for input)
    if (userFlowState[phoneNumber]?.step) {
        const result = await handleFormSubmission(phoneNumber, incomingMessage, userFlowState[phoneNumber]);

        if (result.success) {
            // Clear flow state on success
            delete userFlowState[phoneNumber];

            return {
                type: 'text',
                message: result.message,
                language: result.language,
                sendFollowUpMenu: result.sendFollowUpMenu,
            };
        } else {
            return {
                type: 'buttons',
                bodyText: result.message,
                buttons: [{ id: 'menu', title: result.language === 'english' ? 'Main Menu' : 'मुख्य मेनू' }],
                language: result.language,
                sendFollowUpMenu: result.sendFollowUpMenu,
            };
        }
    }

    // Show service menu for any other message
    return getServiceMenu(userLanguage);
}

/**
 * Handle interactive button/list responses
 */
async function handleInteractiveResponse(
    phoneNumber: string,
    interactiveId: string
): Promise<ChatbotResponse> {
    await connectDB();

    if (interactiveId === 'menu' || interactiveId === 'main_menu') {
        if (userFlowState[phoneNumber]) {
            delete userFlowState[phoneNumber];
        }
    }

    // Language selection
    if (interactiveId === 'lang_english' || interactiveId === 'lang_hindi') {
        const language = interactiveId === 'lang_english' ? 'english' : 'hindi';

        await Contact.findOneAndUpdate(
            { phoneNumber },
            { language },
            { upsert: true }
        );

        return await showDisclaimerAndContacts(phoneNumber, language);
    }

    // Main service selection
    if (interactiveId.startsWith('service_')) {
        const contact = await Contact.findOne({ phoneNumber });
        const language = contact?.language || 'english';
        return await handleServiceSelection(phoneNumber, interactiveId, language);
    }

    // Sub-service selections
    if (interactiveId.startsWith('sub_')) {
        const contact = await Contact.findOne({ phoneNumber });
        const language = contact?.language || 'english';
        return await handleSubServiceSelection(phoneNumber, interactiveId, language);
    }

    // Default: show service menu
    const contact = await Contact.findOne({ phoneNumber });
    return getServiceMenu(contact?.language || 'english');
}

/**
 * Show disclaimer and police contacts after language selection
 */
async function showDisclaimerAndContacts(
    phoneNumber: string,
    language: 'english' | 'hindi'
): Promise<ChatbotResponse> {
    const stations = await PoliceStation.find({ isActive: true }).sort({ name: 1 }).limit(39);

    let message = '';

    if (language === 'english') {
        message = `✅ *You have selected English language.*\n\nWe will provide you with information about Deoghar Police services in this language.\n\n`;
        message += `⚠️ *BEWARE:* Unauthorized WhatsApp chatbots may ask for personal details, links, or downloads. These can be SCAMS! Report immediately on *1930*.\n\n`;
        message += `📋 *Disclaimer:* This WhatsApp Chatbot is only for Deoghar Police. For *URGENT* matters, visit nearest police station or call *112* or District Control Room on *9241821642*.\n\n`;
        message += `📞 *Police Station Contact Numbers:*\n\n`;

        stations.forEach((station, index) => {
            message += `${index + 1}. ${station.name} - ${station.contactNumber}\n`;
        });

        message += `\n\nPlease select a service from the menu below.`;
        message += `\n\n_Powered by DigiCraft Innovation Pvt. Ltd._`;
    } else {
        message = `✅ *आपने हिंदी भाषा का चयन किया है।*\n\nहम आपको इस भाषा में देवघर पुलिस सेवाओं के बारे में जानकारी प्रदान करेंगे।\n\n`;
        message += `⚠️ *सावधान:* अनधिकृत व्हाट्सएप चैटबॉट व्यक्तिगत विवरण, लिंक या डाउनलोड मांग सकते हैं। ये घोटाले हो सकते हैं! तुरंत *1930* पर रिपोर्ट करें।\n\n`;
        message += `📋 *अस्वीकरण:* यह व्हाट्सएप चैटबॉट केवल देवघर पुलिस के लिए है। *तत्काल* मामलों के लिए, निकटतम पुलिस स्टेशन पर जाएं या *112* या जिला नियंत्रण कक्ष *9241821642* पर कॉल करें।\n\n`;
        message += `📞 *पुलिस स्टेशन संपर्क नंबर:*\n\n`;

        stations.forEach((station, index) => {
            message += `${index + 1}. ${station.nameHindi} - ${station.contactNumber}\n`;
        });

        message += `\n\nकृपया नीचे दिए गए मेनू से एक सेवा चुनें।`;
        message += `\n\n_Powered by DigiCraft Innovation Pvt. Ltd._`;
    }

    // Send disclaimer and contacts, then return service menu
    await sendWhatsAppMessage({ to: phoneNumber, text: message });

    // Return service menu
    return getServiceMenu(language);
}

/**
 * Get main service menu
 */
function getServiceMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Select a Police Service*\n\nPlease choose from the options below:\n\n_Powered by DigiCraft Innovation Pvt. Ltd._',
            buttonText: 'View Services',
            sections: [
                {
                    rows: [
                        { id: 'service_passport', title: 'Passport Issues', description: 'Passport verification issues' },
                        { id: 'service_character', title: 'Character Verification', description: 'Character verification issues' },
                        { id: 'service_petition', title: 'SP Office Petition', description: 'Issues with petition to SP' },
                        { id: 'service_location', title: 'Location Service', description: 'Find nearest police station' },
                        { id: 'service_lost_phone', title: 'Lost Mobile Phone', description: 'Report lost phone' },
                        { id: 'service_traffic', title: 'Traffic Issues', description: 'Traffic related queries' },
                        { id: 'service_cyber', title: 'Cyber Crime', description: 'Cyber crime reporting' },
                        { id: 'service_suggestion', title: 'Suggestion / Review', description: 'Share your suggestion or review' },
                        { id: 'service_change_lang', title: 'Change Language', description: 'Switch to Hindi' },
                    ],
                },
            ],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*पुलिस सेवा चुनें*\n\nकृपया नीचे दिए गए विकल्पों में से चुनें:\n\n_Powered by DigiCraft Innovation Pvt. Ltd._',
            buttonText: 'सेवाएं देखें',
            sections: [
                {
                    rows: [
                        { id: 'service_passport', title: 'पासपोर्ट समस्याएं', description: 'पासपोर्ट सत्यापन समस्याएं' },
                        { id: 'service_character', title: 'चरित्र सत्यापन', description: 'चरित्र सत्यापन समस्याएं' },
                        { id: 'service_petition', title: 'एसपी कार्यालय याचिका', description: 'एसपी को याचिका से संबंधित मुद्दे' },
                        { id: 'service_location', title: 'स्थान सेवा', description: 'निकटतम पुलिस स्टेशन खोजें' },
                        { id: 'service_lost_phone', title: 'खोया मोबाइल फोन', description: 'खोया फोन रिपोर्ट करें' },
                        { id: 'service_traffic', title: 'यातायात समस्याएं', description: 'यातायात संबंधी प्रश्न' },
                        { id: 'service_cyber', title: 'साइबर अपराध', description: 'साइबर अपराध रिपोर्टिंग' },
                        { id: 'service_suggestion', title: 'सुझाव / समीक्षा', description: 'अपने सुझाव या समीक्षा साझा करें' },
                        { id: 'service_change_lang', title: 'भाषा बदलें', description: 'अंग्रेजी में स्विच करें' },
                    ],
                },
            ],
        };
    }
}

/**
 * Handle main service selection
 */
async function handleServiceSelection(
    phoneNumber: string,
    serviceId: string,
    language: 'english' | 'hindi'
): Promise<ChatbotResponse> {
    // Language change
    if (serviceId === 'service_change_lang') {
        return {
            type: 'buttons',
            bodyText: language === 'english'
                ? 'Switch to Hindi?\n\nहिंदी में बदलें?'
                : 'Switch to English?\n\nअंग्रेजी में बदलें?',
            buttons: [
                {
                    id: language === 'english' ? 'lang_hindi' : 'lang_english',
                    title: language === 'english' ? 'हिंदी' : 'English'
                },
            ],
        };
    }

    // Show sub-menus for each service
    switch (serviceId) {
        case 'service_passport':
            return getPassportSubMenu(language);
        case 'service_character':
            return getCharacterSubMenu(language);
        case 'service_petition':
            return getPetitionSubMenu(language);
        case 'service_location':
            return await getLocationService(phoneNumber, language);
        case 'service_lost_phone':
            return getLostPhoneSubMenu(language);
        case 'service_traffic':
            return getTrafficSubMenu(language);
        case 'service_cyber':
            return getCyberSubMenu(language);
        case 'service_suggestion':
            userFlowState[phoneNumber] = { step: 'suggestion_form' };
            return getSuggestionForm(language);
        default:
            return getServiceMenu(language);
    }
}

/**
 * Passport sub-menu
 */
function getPassportSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Passport Related Issues*\n\nSelect your issue:',
            buttonText: 'Select Issue',
            sections: [{
                rows: [
                    { id: 'sub_passport_delay', title: 'Delay in Verification', description: 'Police verification is delayed' },
                    { id: 'sub_passport_other', title: 'Other Issues', description: 'Other passport related issues' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*पासपोर्ट संबंधी समस्याएं*\n\nअपनी समस्या चुनें:',
            buttonText: 'समस्या चुनें',
            sections: [{
                rows: [
                    { id: 'sub_passport_delay', title: 'सत्यापन में देरी', description: 'पुलिस सत्यापन में देरी हो रही है' },
                    { id: 'sub_passport_other', title: 'अन्य समस्याएं', description: 'अन्य पासपोर्ट संबंधी समस्याएं' },
                ],
            }],
        };
    }
}

/**
 * Character verification sub-menu
 */
function getCharacterSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Character Verification Issues*\n\nSelect your issue:',
            buttonText: 'Select Issue',
            sections: [{
                rows: [
                    { id: 'sub_character_delay', title: 'Delay in Verification', description: 'Police verification is delayed' },
                    { id: 'sub_character_other', title: 'Other Issues', description: 'Other verification issues' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*चरित्र सत्यापन समस्याएं*\n\nअपनी समस्या चुनें:',
            buttonText: 'समस्या चुनें',
            sections: [{
                rows: [
                    { id: 'sub_character_delay', title: 'सत्यापन में देरी', description: 'पुलिस सत्यापन में देरी हो रही है' },
                    { id: 'sub_character_other', title: 'अन्य समस्याएं', description: 'अन्य सत्यापन समस्याएं' },
                ],
            }],
        };
    }
}

/**
 * Petition sub-menu
 */
function getPetitionSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Issues with Petition to SP Office*\n\nSelect your issue:',
            buttonText: 'Select Issue',
            sections: [{
                rows: [
                    { id: 'sub_petition_not_visited', title: 'Police Did Not Visit', description: 'Police have not visited yet' },
                    { id: 'sub_petition_not_satisfied', title: 'Not Satisfied', description: 'Not satisfied with police response' },
                    { id: 'sub_petition_other', title: 'Other Issues', description: 'Other petition related issues' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*एसपी कार्यालय में याचिका से संबंधित मुद्दे*\n\nअपनी समस्या चुनें:',
            buttonText: 'समस्या चुनें',
            sections: [{
                rows: [
                    { id: 'sub_petition_not_visited', title: 'पुलिस नहीं आई', description: 'पुलिस अभी तक नहीं आई है' },
                    { id: 'sub_petition_not_satisfied', title: 'संतुष्ट नहीं', description: 'पुलिस की प्रतिक्रिया से संतुष्ट नहीं' },
                    { id: 'sub_petition_other', title: 'अन्य समस्याएं', description: 'अन्य याचिका संबंधी मुद्दे' },
                ],
            }],
        };
    }
}

/**
 * Location service - request user's location then find nearest station
 */
async function getLocationService(phoneNumber: string, language: 'english' | 'hindi'): Promise<ChatbotResponse> {
    userFlowState[phoneNumber] = { step: 'awaiting_location' };

    // Send location request button
    const { sendLocationRequest } = await import('./whatsapp');

    const bodyText = language === 'english'
        ? `📍 *Find Your Nearest Police Station*\n\nTo help you find the nearest police station, please share your current location by clicking the button below.\n\nYour location will only be used to find the closest station in Deoghar district.`
        : `📍 *अपना निकटतम पुलिस स्टेशन खोजें*\n\nआपको निकटतम पुलिस स्टेशन खोजने में मदद करने के लिए, कृपया नीचे दिए गए बटन पर क्लिक करके अपना वर्तमान स्थान साझा करें।\n\nआपके स्थान का उपयोग केवल देवघर जिले में निकटतम स्टेशन खोजने के लिए किया जाएगा।`;

    await sendLocationRequest({
        to: phoneNumber,
        bodyText,
    });

    // Return a confirmation that button was sent
    return {
        type: 'text',
        message: language === 'english'
            ? '📍 Please click the "Send Location" button above to share your location.'
            : '📍 कृपया अपना स्थान साझा करने के लिए ऊपर "स्थान भेजें" बटन पर क्लिक करें।',
        language,
        // No followUpMenu here — we're still waiting for the user's location pin
    };
}

/**
 * Lost phone sub-menu
 */
function getLostPhoneSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Lost Mobile Phone*\n\nSelect your option:',
            buttonText: 'Select Option',
            sections: [{
                rows: [
                    { id: 'sub_lost_mobile', title: 'Report Lost Phone', description: 'Report a lost mobile phone' },
                    { id: 'sub_lost_mobile_not_satisfied', title: 'Not Satisfied', description: 'Not satisfied with police action' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*खोया मोबाइल फोन*\n\nअपना विकल्प चुनें:',
            buttonText: 'विकल्प चुनें',
            sections: [{
                rows: [
                    { id: 'sub_lost_mobile', title: 'खोया फोन रिपोर्ट करें', description: 'अपने खोए फोन की रिपोर्ट करें' },
                    { id: 'sub_lost_mobile_not_satisfied', title: 'संतुष्ट नहीं', description: 'पुलिस कार्रवाई से संतुष्ट नहीं' },
                ],
            }],
        };
    }
}

/**
 * Traffic sub-menu
 */
function getTrafficSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Traffic Related Issues*\n\nSelect your query:',
            buttonText: 'Select Query',
            sections: [{
                rows: [
                    { id: 'sub_traffic_rules', title: 'Rules & Penalties', description: 'Know about violations & fines' },
                    { id: 'sub_traffic_jam', title: 'Report Traffic Jam', description: 'Report traffic congestion' },
                    { id: 'sub_traffic_challan', title: 'Traffic Challan Issues', description: 'Challan related queries' },
                    { id: 'sub_traffic_other', title: 'Other Issues', description: 'Other traffic issues' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*यातायात संबंधी समस्याएं*\n\nअपना प्रश्न चुनें:',
            buttonText: 'प्रश्न चुनें',
            sections: [{
                rows: [
                    { id: 'sub_traffic_rules', title: 'यातायात नियम/जुर्माना', description: 'उल्लंघन और जुर्माने के बारे में जानें' },
                    { id: 'sub_traffic_jam', title: 'ट्रैफ़िक जाम रिपोर्ट', description: 'यातायात भीड़ की रिपोर्ट करें' },
                    { id: 'sub_traffic_challan', title: 'ट्रैफ़िक चालान मुद्दे', description: 'चालान संबंधी प्रश्न' },
                    { id: 'sub_traffic_other', title: 'अन्य समस्याएं', description: 'अन्य यातायात समस्याएं' },
                ],
            }],
        };
    }
}

/**
 * Cyber sub-menu
 */
function getCyberSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'list',
            bodyText: '*Cyber Crime*\n\nSelect your issue:',
            buttonText: 'Select Issue',
            sections: [{
                rows: [
                    { id: 'sub_cyber', title: 'Report Cyber Crime', description: 'Report a cyber fraud' },
                    { id: 'sub_cyber_other', title: 'Other Issues', description: 'Other cyber-related issues' },
                ],
            }],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*साइबर अपराध*\n\nअपनी समस्या चुनें:',
            buttonText: 'समस्या चुनें',
            sections: [{
                rows: [
                    { id: 'sub_cyber', title: 'साइबर अपराध रिपोर्ट', description: 'साइबर धोखाधड़ी की रिपोर्ट करें' },
                    { id: 'sub_cyber_other', title: 'अन्य समस्याएं', description: 'अन्य साइबर संबंधी मुद्दे' },
                ],
            }],
        };
    }
}

/**
 * Suggestion form
 */
/**
 * Suggestion/Review form
 */
function getSuggestionForm(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'buttons',
            bodyText: `💡 *Share Your Suggestion/Review*\n\nPlease simply type your Name and your Suggestion/Review.\n\n*Example:*\nRahul Kumar\nExcellent service by the traffic police team.\n\nPlease reply now.`,
            buttons: [{ id: 'menu', title: 'Main Menu' }],
            language,
        };
    } else {
        return {
            type: 'buttons',
            bodyText: `💡 *अपना सुझाव/समीक्षा साझा करें*\n\nकृपया बस अपना नाम और अपना सुझाव/समीक्षा टाइप करें।\n\n*उदाहरण:*\nराहुल कुमार\nट्रैफिक पुलिस टीम द्वारा उत्कृष्ट सेवा।\n\nकृपया अभी उत्तर दें।`,
            buttons: [{ id: 'menu', title: 'मुख्य मेनू' }],
            language,
        };
    }
}

/**
 * Handle sub-service selections
 */
async function handleSubServiceSelection(
    phoneNumber: string,
    subServiceId: string,
    language: 'english' | 'hindi'
): Promise<ChatbotResponse> {
    // Set flow state for form collection
    userFlowState[phoneNumber] = { step: subServiceId };

    // Handle traffic rules separately (it returns ChatbotResponse)
    if (subServiceId === 'sub_traffic_rules') {
        return await getTrafficRulesInfo(language);
    }

    // Show appropriate form based on sub-service
    const formMessages: Record<string, { english: string; hindi: string }> = {
        sub_passport_delay: {
            english: `📝 *Passport Verification Delay*\n\nPlease provide the following details (one per line):\n\n*Line 1:* Name of Applicant\n*Line 2:* Passport Application Number\n*Line 3:* Remarks\n\n*Example:*\nRahul Kumar\nAB1234567\nVerification pending since 2 months\n\nPlease reply with all details.`,
            hindi: `📝 *पासपोर्ट सत्यापन में देरी*\n\nकृपया निम्नलिखित विवरण प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आवेदक का नाम\n*पंक्ति 2:* पासपोर्ट आवेदन संख्या\n*पंक्ति 3:* टिप्पणी\n\n*उदाहरण:*\nराहुल कुमार\nAB1234567\n2 महीने से सत्यापन लंबित\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_passport_other: {
            english: `📝 *Other Passport Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Issue Details\n\n*Example:*\nPriya Sharma\nCD9876543\nDocument submission issue\n\nPlease reply with details.`,
            hindi: `📝 *अन्य पासपोर्ट समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* समस्या विवरण\n\n*उदाहरण:*\nप्रिया शर्मा\nCD9876543\nदस्तावेज जमा करने में समस्या\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_character_delay: {
            english: `📝 *Character Verification Delay*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Remarks\n\n*Example:*\nSunil Verma\nCH12345\nVerification is delayed by 15 days\n\nPlease reply with all details.`,
            hindi: `📝 *चरित्र सत्यापन में देरी*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* टिप्पणी\n\n*उदाहरण:*\nसुनील वर्मा\nCH12345\nसत्यापन 15 दिनों से लंबित है\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_character_other: {
            english: `📝 *Other Character Verification Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Issue Details\n\n*Example:*\nSunil Verma\nCH12345\nName is misspelled in the application\n\nPlease reply with details.`,
            hindi: `📝 *अन्य चरित्र सत्यापन समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* समस्या विवरण\n\n*उदाहरण:*\nसुनील वर्मा\nCH12345\nआवेदन में नाम की वर्तनी गलत है\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_petition_not_visited: {
            english: `📝 *Police Did Not Visit - Petition*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Concerned Police Station\n*Line 6:* Issue Details\n\n*Example:*\nAmit Singh\nRakesh Singh\nWard 5, Deoghar\n9876543210\nTown Thana\nPolice did not visit regarding my petition filed 5 days ago\n\nPlease reply with all details.`,
            hindi: `📝 *पुलिस नहीं आई - याचिका*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* संबंधित पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\n*उदाहरण:*\nअमित सिंह\nराकेश सिंह\nवार्ड 5, देवघर\n9876543210\nनगर थाना\n5 दिन पहले दायर याचिका के संबंध में पुलिस नहीं आई\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_petition_not_satisfied: {
            english: `📝 *Not Satisfied with Police Response*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Reason for Dissatisfaction\n\n*Example:*\nVikash Yadav\nSuresh Yadav\nJasidih, Deoghar\n9876543211\nJasidih Thana\nThe investigation was closed without taking my statement\n\nPlease reply with all details.`,
            hindi: `📝 *पुलिस की प्रतिक्रिया से संतुष्ट नहीं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* असंतोष का कारण\n\n*उदाहरण:*\nविकाश यादव\nसुरेश यादव\nजसीडीह, देवघर\n9876543211\nजसीडीह थाना\nमेरा बयान लिए बिना जांच बंद कर दी गई\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_petition_other: {
            english: `📝 *Other Petition Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Issue Details\n\n*Example:*\nNeha Kumari\nManoj Prasad\nMadhupur\n9876543212\nMadhupur Thana\nNeed an update on the status of my petition\n\nPlease reply with all details.`,
            hindi: `📝 *अन्य याचिका समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\n*उदाहरण:*\nनेहा कुमारी\nमनोज प्रसाद\nमधुपुर\n9876543212\nमधुपुर थाना\nमुझे अपनी याचिका की स्थिति का अपडेट चाहिए\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_jam: {
            english: `🚦 *Report Traffic Jam*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Mobile Number\n*Line 3:* Traffic Jam Location\n*Line 4:* Remarks\n\n*Example:*\nRajeev Kumar\n9876543213\nTower Chowk\nHeavy traffic congestion for the last hour\n\nPlease reply with all details.`,
            hindi: `🚦 *ट्रैफ़िक जाम रिपोर्ट*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* ट्रैफ़िक जाम का स्थान\n*पंक्ति 4:* टिप्पणी\n\n*उदाहरण:*\nराजीव कुमार\n9876543213\nटावर चौक\nपिछले एक घंटे से भारी ट्रैफ़िक जाम है\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_challan: {
            english: `🚦 *Traffic Challan Issues*\n\nYou can pay online at: www.echallan.parivahan.gov.in\n\nTo report an issue, please provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Mobile Number\n*Line 3:* Challan Number\n*Line 4:* Issue Details\n\n*Example:*\nSanjay Gupta\n9876543214\nJH12345678\nI was wearing a helmet but still got a challan\n\nPlease reply with details.`,
            hindi: `🚦 *ट्रैफ़िक चालान मुद्दे*\n\nआप ऑनलाइन भुगतान कर सकते हैं: www.echallan.parivahan.gov.in\n\nसमस्या रिपोर्ट करने के लिए, कृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* चालान नंबर\n*पंक्ति 4:* समस्या विवरण\n\n*उदाहरण:*\nसंजय गुप्ता\n9876543214\nJH12345678\nमैंने हेलमेट पहना था फिर भी चालान कट गया\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_other: {
            english: `🚦 *Other Traffic Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Mobile Number\n*Line 3:* Interested Police Station\n*Line 4:* Issue Details\n\n*Example:*\nPooja Dey\n9876543215\nTraffic Thana\nA traffic light is not functioning at Bajrangbali Chowk\n\nPlease reply with details.`,
            hindi: `🚦 *अन्य यातायात समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* संबंधित पुलिस स्टेशन\n*पंक्ति 4:* समस्या विवरण\n\n*उदाहरण:*\nपूजा डे\n9876543215\nयातायात थाना\nबजरंगबली चौक पर ट्रैफिक लाइट काम नहीं कर रही है\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_lost_mobile: {
            english: `📱 *Report Lost Mobile Phone*\n\nFor faster response, please first report your lost mobile on:\n🔗 www.ceir.gov.in\n\nTo register your complaint here, please reply with in this format:\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Lost Mobile Number\n*Line 6:* Concerned Police Station\n\n*Example:*\nSanjay Sharma\nRahul Sharma\nWilliams Town\n9876543210\n9876543211\nTown Thana\n\nPlease reply with all details.`,
            hindi: `📱 *खोया मोबाइल फोन रिपोर्ट*\n\nतेजी से प्रतिक्रिया के लिए, पहले अपने खोए फोन की रिपोर्ट यहाँ करें:\n🔗 www.ceir.gov.in\n\nयहाँ शिकायत दर्ज करने के लिए, कृपया इस प्रकार उत्तर दें:\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* खोया मोबाइल नंबर\n*पंक्ति 6:* संबंधित पुलिस स्टेशन\n\n*उदाहरण:*\nसंजय शर्मा\nराहुल शर्मा\nविलियम्स टाउन\n9876543210\n9876543211\nनगर थाना\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_lost_mobile_not_satisfied: {
            english: `📱 *Not Satisfied with Police Action*\n\nIf you're not satisfied with police action on your lost mobile, please reply with:\n\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Lost Mobile Number\n*Line 6:* Concerned Police Station\n\n*Example:*\nSanjay Sharma\nRahul Sharma\nWilliams Town\n9876543210\n9876543211\nTown Thana\n\nPlease reply with all details.`,
            hindi: `📱 *पुलिस कार्रवाई से संतुष्ट नहीं*\n\nयदि आप पुलिस कार्रवाई से संतुष्ट नहीं हैं, तो कृपया निम्नलिखित के साथ उत्तर दें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* खोया मोबाइल नंबर\n*पंक्ति 6:* संबंधित पुलिस स्टेशन\n\n*उदाहरण:*\nसंजय शर्मा\nराहुल शर्मा\nविलियम्स टाउन\n9876543210\n9876543211\nनगर थाना\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_cyber: {
            english: `💻 *Report Cyber Crime*\n\nYou can also report at:\n🔗 https://cybercrime.gov.in\n📞 Call 1930\n\nTo register your complaint here, please reply with:\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Issue Details\n\n*Example:*\nKamal Roy\nBijay Roy\nBompas Town\n9876543210\nCyber Thana\nAmount fraudulently deducted\n\nPlease reply with details.`,
            hindi: `💻 *साइबर अपराध रिपोर्ट*\n\nआप यहाँ भी रिपोर्ट कर सकते हैं:\n🔗 https://cybercrime.gov.in\n📞 कॉल 1930\n\nयहाँ शिकायत दर्ज करने के लिए, कृपया उत्तर दें:\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* मुद्दे का विवरण\n\n*उदाहरण:*\nकमल रॉय\nबिजय रॉय\nबोम्पस टाउन\n9876543210\nसाइबर थाना\nमेरे खाते से पैसे काटे गए\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_cyber_other: {
            english: `💻 *Other Cyber Issues*\n\nIf you have other cyber-related issues, please reply with:\n\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Issue Details\n\n*Example:*\nKamal Roy\nBijay Roy\nBompas Town\n9876543210\nCyber Thana\nQuery regarding social media hack\n\nPlease reply with details.`,
            hindi: `💻 *अन्य साइबर मुद्दे*\n\nयदि आपके पास अन्य साइबर संबंधी मुद्दे हैं, तो कृपया उत्तर दें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* मुद्दे का विवरण\n\n*उदाहरण:*\nकमल रॉय\nबिजय रॉय\nबोम्पस टाउन\n9876543210\nसाइबर थाना\nसोशल मीडिया हैक के संबंध में प्रश्न\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
    };

    const message = formMessages[subServiceId];
    if (!message) {
        return getServiceMenu(language);
    }

    return {
        type: 'buttons',
        bodyText: message[language],
        buttons: [{ id: 'menu', title: language === 'english' ? 'Main Menu' : 'मुख्य मेनू' }],
        language,
    };
}

/**
 * Get traffic rules and penalties from database
 */
async function getTrafficRulesInfo(language: 'english' | 'hindi'): Promise<ChatbotResponse> {
    const violations = await TrafficViolation.find({ isActive: true }).sort({ section: 1 });

    let message = '';

    if (language === 'english') {
        message = `🚦 *Traffic Rules & Penalties*\n\n`;
        
        message += `*Most Common Violations & Fines:*\n`;
        message += `1. Without Helmet (Sec 194D) - ₹1,000\n`;
        message += `2. Without Seat Belt (Sec 194B) - ₹1,000\n`;
        message += `3. Without License (Sec 181) - ₹5,000\n`;
        message += `4. Without Insurance (Sec 196) - ₹2,000\n`;
        message += `5. Over-speeding (Sec 183) - ₹1,000 to ₹2,000\n`;
        message += `6. Drunk Driving (Sec 185) - ₹10,000\n\n`;

        if (violations && violations.length > 0) {
            message += `*Other Motor Vehicle Act Violations:*\n\n`;
            violations.forEach((v) => {
                message += `• *${v.crime}*\n`;
                message += `   Section: ${v.section}\n`;
                message += `   Penalty: ₹${v.penalty.toLocaleString()}\n\n`;
            });
        }

        message += `\n📞 Traffic Police Station: +919296811585\n`;
        message += `📍 Location: https://www.google.com/maps?q=24.490654,86.691856\n\n`;
        message += `*Important Acts & Laws (Click to View):*\n`;
        message += `• Central Motor Vehicle Act, 1988:\n  🔗 https://morth.nic.in/motor-vehicles-act-1988\n`;
        message += `• Motor Vehicle Driving Regulation 2017:\n  🔗 https://morth.nic.in/sites/default/files/Motor_Vehicles_Driving_Regulation_2017.pdf\n`;
        message += `• Road Safety Signage & Signs:\n  🔗 https://morth.nic.in/sites/default/files/road_safety_signs.pdf\n`;
    } else {
        message = `🚦 *यातायात नियम और जुर्माना*\n\n`;
        
        message += `*सबसे आम उल्लंघन और जुर्माना:*\n`;
        message += `1. बिना हेलमेट के (धारा 194D) - ₹1,000\n`;
        message += `2. बिना सीट बेल्ट के (धारा 194B) - ₹1,000\n`;
        message += `3. बिना लाइसेंस के (धारा 181) - ₹5,000\n`;
        message += `4. बिना बीमा के (धारा 196) - ₹2,000\n`;
        message += `5. ओवर-स्पीडिंग (धारा 183) - ₹1,000 से ₹2,000\n`;
        message += `6. शराब पीकर गाड़ी चलाना (धारा 185) - ₹10,000\n\n`;

        if (violations && violations.length > 0) {
            message += `*अन्य मोटर वाहन अधिनियम उल्लंघन:*\n\n`;
            violations.forEach((v) => {
                message += `• *${v.crimeHindi}*\n`;
                message += `   धारा: ${v.section}\n`;
                message += `   जुर्माना: ₹${v.penalty.toLocaleString()}\n\n`;
            });
        }

        message += `\n📞 ट्रैफ़िक पुलिस स्टेशन: +919296811585\n`;
        message += `📍 स्थान: https://www.google.com/maps?q=24.490654,86.691856\n\n`;
        message += `*महत्वपूर्ण अधिनियम और कानून (देखने के लिए क्लिक करें):*\n`;
        message += `• केंद्रीय मोटर वाहन अधिनियम, 1988:\n  🔗 https://morth.nic.in/motor-vehicles-act-1988\n`;
        message += `• मोटर वाहन ड्राइविंग विनियम 2017:\n  🔗 https://morth.nic.in/sites/default/files/Motor_Vehicles_Driving_Regulation_2017.pdf\n`;
        message += `• सड़क सुरक्षा चिह्न और संकेत:\n  🔗 https://morth.nic.in/sites/default/files/road_safety_signs.pdf\n`;
    }

    return {
        type: 'text',
        message,
        language,
        sendFollowUpMenu: true,  // traffic rules is a read-only info page → cycle ends
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
 * Look up a contact's language preference and send the service menu to them.
 * Called by the webhook after a terminal response to close the cycle and return
 * the user to the main service selection list automatically.
 */
export async function getContactLanguageAndSendMenu(phoneNumber: string): Promise<void> {
    await connectDB();
    const contact = await Contact.findOne({ phoneNumber });
    const language = contact?.language || 'english';
    const menu = getServiceMenu(language);
    await sendChatbotResponse(phoneNumber, menu);
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

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Handle location message and find nearest police station
 */
export async function handleLocationMessage(
    phoneNumber: string,
    latitude: number,
    longitude: number
): Promise<ChatbotResponse> {
    await connectDB();

    const contact = await Contact.findOne({ phoneNumber });
    const language = contact?.language || 'english';

    // Clear location flow state
    delete userFlowState[phoneNumber];

    // Get all police stations
    const stations = await PoliceStation.find({ isActive: true });

    // Calculate distances and find nearest
    const stationsWithDistance = stations.map(station => ({
        station,
        distance: calculateDistance(
            latitude,
            longitude,
            station.location.coordinates[1], // latitude
            station.location.coordinates[0]  // longitude
        ),
    }));

    // Filter stations within 15km range
    const nearbyStations = stationsWithDistance.filter(item => item.distance <= 15);

    // Sort by distance and get top 1
    nearbyStations.sort((a, b) => a.distance - b.distance);
    const nearestStations = nearbyStations.slice(0, 1);

    // Build response message
    let message = '';

    if (nearestStations.length === 0) {
        if (language === 'english') {
            message = `📍 *No Police Station Found*\n\nIt seems you are currently outside the 15KM range of Deoghar Police Stations. Please try again when you are within the district, or call *112* for emergencies.`;
        } else {
            message = `📍 *कोई पुलिस स्टेशन नहीं मिला*\n\nऐसा लगता है कि आप वर्तमान में देवघर पुलिस स्टेशनों की 15 किमी की सीमा से बाहर हैं। कृपया जिले में होने पर पुनः प्रयास करें, या आपातकालीन स्थिति के लिए *112* पर कॉल करें।`;
        }
        return {
            type: 'text',
            message,
            language,
            sendFollowUpMenu: true,
        };
    }

    if (language === 'english') {
        message = `📍 *Nearest Police Station to Your Location*\n\n`;

        nearestStations.forEach((item) => {
            const { station, distance } = item;
            const mapLink = `https://www.google.com/maps?q=${station.location.coordinates[1]},${station.location.coordinates[0]}`;
            message += `*${station.name}*\n`;
            message += `   📞 ${station.contactNumber}\n`;
            message += `   📏 Distance: ${distance.toFixed(2)} km\n`;
            message += `   📍 Location: ${mapLink}\n`;
            if (station.inchargeName) {
                message += `   👮 Incharge: ${station.inchargeName}\n`;
            }
            message += `\n`;
        });
    } else {
        message = `📍 *आपके स्थान के निकटतम पुलिस स्टेशन*\n\n`;

        nearestStations.forEach((item) => {
            const { station, distance } = item;
            const mapLink = `https://www.google.com/maps?q=${station.location.coordinates[1]},${station.location.coordinates[0]}`;
            message += `*${station.nameHindi}*\n`;
            message += `   📞 ${station.contactNumber}\n`;
            message += `   📏 दूरी: ${distance.toFixed(2)} किमी\n`;
            message += `   📍 स्थान: ${mapLink}\n`;
            if (station.inchargeNameHindi) {
                message += `   👮 प्रभारी: ${station.inchargeNameHindi}\n`;
            }
            message += `\n`;
        });
    }

    return {
        type: 'text',
        message,
        language,
        sendFollowUpMenu: true,  // location result is terminal → cycle ends
    };
}
