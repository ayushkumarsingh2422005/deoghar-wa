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

    // Check for exit/menu keywords to break any loop
    const normalizedMessage = incomingMessage.toLowerCase().trim();
    const exitKeywords = ['menu', 'cancel', 'exit', 'stop', 'main menu', 'help', 'hi', 'hello', 'menue'];

    if (exitKeywords.includes(normalizedMessage)) {
        // Clear any existing flow state
        if (userFlowState[phoneNumber]) {
            delete userFlowState[phoneNumber];
        }

        const contact = await Contact.findOne({ phoneNumber });
        const userLanguage = contact?.language || 'english';

        // Return main menu
        return getServiceMenu(userLanguage);
    }

    // Check if user is in a form flow (waiting for input)
    if (userFlowState[phoneNumber]?.step) {
        const result = await handleFormSubmission(phoneNumber, incomingMessage, userFlowState[phoneNumber]);

        if (result.success) {
            // Clear flow state on success
            delete userFlowState[phoneNumber];
        }

        return {
            type: 'text',
            message: result.message,
            language: result.language,
        };
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

        // Show disclaimer and contacts after language selection
        return await showDisclaimerAndContacts(phoneNumber, languageSelection);
    }

    // Get user's current language preference
    const contact = await Contact.findOne({ phoneNumber });
    const userLanguage = contact?.language;

    // If no language set, send language selection buttons
    if (!userLanguage) {
        return {
            type: 'buttons',
            bodyText: `*Welcome to Deoghar Police Official WhatsApp Chatbot*\n\nPlease select your official language:\n\n*देवघर पुलिस आधिकारिक व्हाट्सएप चैटबॉट में आपका स्वागत है*\n\nकृपया अपनी आधिकारिक भाषा चुनें:`,
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
 * Handle interactive button/list responses
 */
async function handleInteractiveResponse(
    phoneNumber: string,
    interactiveId: string
): Promise<ChatbotResponse> {
    await connectDB();

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
    } else {
        message = `✅ *आपने हिंदी भाषा का चयन किया है।*\n\nहम आपको इस भाषा में देवघर पुलिस सेवाओं के बारे में जानकारी प्रदान करेंगे।\n\n`;
        message += `⚠️ *सावधान:* अनधिकृत व्हाट्सएप चैटबॉट व्यक्तिगत विवरण, लिंक या डाउनलोड मांग सकते हैं। ये घोटाले हो सकते हैं! तुरंत *1930* पर रिपोर्ट करें।\n\n`;
        message += `📋 *अस्वीकरण:* यह व्हाट्सएप चैटबॉट केवल देवघर पुलिस के लिए है। *तत्काल* मामलों के लिए, निकटतम पुलिस स्टेशन पर जाएं या *112* या जिला नियंत्रण कक्ष *9241821642* पर कॉल करें।\n\n`;
        message += `📞 *पुलिस स्टेशन संपर्क नंबर:*\n\n`;

        stations.forEach((station, index) => {
            message += `${index + 1}. ${station.nameHindi} - ${station.contactNumber}\n`;
        });

        message += `\n\nकृपया नीचे दिए गए मेनू से एक सेवा चुनें।`;
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
            bodyText: '*Select a Police Service*\n\nPlease choose from the options below:',
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
                        { id: 'service_suggestion', title: 'Suggestions', description: 'Share your suggestions' },
                        { id: 'service_change_lang', title: 'Change Language', description: 'Switch to Hindi' },
                    ],
                },
            ],
        };
    } else {
        return {
            type: 'list',
            bodyText: '*पुलिस सेवा चुनें*\n\nकृपया नीचे दिए गए विकल्पों में से चुनें:',
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
                        { id: 'service_suggestion', title: 'सुझाव', description: 'अपने सुझाव साझा करें' },
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
                    title: language === 'english' ? '🇮🇳 हिंदी' : '🇬🇧 English'
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
            userFlowState[phoneNumber] = { step: 'lost_mobile' };
            return getLostPhoneSubMenu(language);
        case 'service_traffic':
            return getTrafficSubMenu(language);
        case 'service_cyber':
            userFlowState[phoneNumber] = { step: 'cyber' };
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
    };
}

/**
 * Lost phone sub-menu
 */
function getLostPhoneSubMenu(language: 'english' | 'hindi'): ChatbotResponse {
    if (language === 'english') {
        return {
            type: 'text',
            message: `📱 *Lost Mobile Phone*\n\nTo report lost mobile phone, please visit:\n🔗 www.ceir.gov.in\n\nWe will get your request from there and inform you as soon as your mobile is found.\n\n*Not Satisfied with Police Action?*\nIf you're not satisfied with police action on your lost mobile, please reply with your:\n- Name\n- Father's Name\n- Address\n- Mobile Number\n- Lost Mobile Number\n- Concerned Police Station\n\nWe will register your complaint.\n\n(Type "Menu" to cancel)`,
            language,
        };
    } else {
        return {
            type: 'text',
            message: `📱 *खोया मोबाइल फोन*\n\nखोया हुआ मोबाइल फोन रिपोर्ट करने के लिए, कृपया यहां जाएं:\n🔗 www.ceir.gov.in\n\nहमें वहां से आपका अनुरोध मिलेगा और जैसे ही आपका मोबाइल मिलेगा, हम आपको सूचित करेंगे।\n\n*पुलिस कार्रवाई से संतुष्ट नहीं?*\nयदि आप अपने खोए हुए मोबाइल पर पुलिस कार्रवाई से संतुष्ट नहीं हैं, तो कृपया निम्नलिखित के साथ उत्तर दें:\n- नाम\n- पिता का नाम\n- पता\n- मोबाइल नंबर\n- खोया मोबाइल नंबर\n- संबंधित पुलिस स्टेशन\n\nहम आपकी शिकायत दर्ज करेंगे।\n\n(रद्द करने के लिए "Menu" टाइप करें)`,
            language,
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
            type: 'text',
            message: `💻 *Cyber Crime Information*\n\nTo know about various types of Cyber Frauds, please visit:\n🔗 https://cybercrime.gov.in/Webform/Accept.aspx\nGo to "Learn about cybercrimes" section.\n\n*How to Report Cyber Crime:*\n📞 Call: 1930\n🏢 Visit: Cyber Police Station\n   Mobile: 9241821643\n   Location: 24.490501,86.690982\n\n*Other Issues:*\nIf you have other cyber-related issues, please reply with:\n- Name\n- Father's Name\n- Address\n- Mobile Number\n- Concerned Police Station\n- Issue Details\n\nWe will register your complaint.\n\n(Type "Menu" to cancel)`,
            language,
        };
    } else {
        return {
            type: 'text',
            message: `💻 *साइबर अपराध जानकारी*\n\nविभिन्न प्रकार के साइबर धोखाधड़ी के बारे में जानने के लिए, कृपया यहां जाएं:\n🔗 https://cybercrime.gov.in/Webform/Accept.aspx\n"साइबर अपराधों के बारे में जानें" अनुभाग पर जाएं।\n\n*साइबर अपराध की रिपोर्ट कैसे करें:*\n📞 कॉल करें: 1930\n🏢 जाएं: साइबर पुलिस स्टेशन\n   मोबाइल: 9241821643\n   स्थान: 24.490501,86.690982\n\n*अन्य मुद्दे:*\nयदि आपके पास अन्य साइबर संबंधी मुद्दे हैं, तो कृपया निम्नलिखित के साथ उत्तर दें:\n- नाम\n- पिता का नाम\n- पता\n- मोबाइल नंबर\n- संबंधित पुलिस स्टेशन\n- मुद्दे का विवरण\n\nहम आपकी शिकायत दर्ज करेंगे।\n\n(रद्द करने के लिए "Menu" टाइप करें)`,
            language,
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
            type: 'text',
            message: `💡 *Share Your Review/Suggestion*\n\nPlease simply type your Name and your Review.\n\n*Example:*\nRahul Kumar\nExcellent service by the traffic police team.\n\nPlease reply now.\n\n(Type "Menu" to cancel)`,
            language,
        };
    } else {
        return {
            type: 'text',
            message: `💡 *अपनी समीक्षा/सुझाव साझा करें*\n\nकृपया बस अपना नाम और अपनी समीक्षा टाइप करें।\n\n*उदाहरण:*\nराहुल कुमार\nट्रैफिक पुलिस टीम द्वारा उत्कृष्ट सेवा।\n\nकृपया अभी उत्तर दें।\n\n(रद्द करने के लिए "Menu" टाइप करें)`,
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
            english: `📝 *Character Verification Delay*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Remarks\n\nPlease reply with all details.`,
            hindi: `📝 *चरित्र सत्यापन में देरी*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* टिप्पणी\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_character_other: {
            english: `📝 *Other Character Verification Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Issue Details\n\nPlease reply with details.`,
            hindi: `📝 *अन्य चरित्र सत्यापन समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* समस्या विवरण\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_petition_not_visited: {
            english: `📝 *Police Did Not Visit - Petition*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Concerned Police Station\n*Line 6:* Issue Details\n\nPlease reply with all details.`,
            hindi: `📝 *पुलिस नहीं आई - याचिका*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* संबंधित पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_petition_not_satisfied: {
            english: `📝 *Not Satisfied with Police Response*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Reason for Dissatisfaction\n\nPlease reply with all details.`,
            hindi: `📝 *पुलिस की प्रतिक्रिया से संत ुष्ट नहीं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* असंतोष का कारण\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_petition_other: {
            english: `📝 *Other Petition Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Police Station\n*Line 6:* Issue Details\n\nPlease reply with all details.`,
            hindi: `📝 *अन्य याचिका समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_jam: {
            english: `🚦 *Report Traffic Jam*\n\nPlease provide (one per line):\n\n*Line 1:* Your Name\n*Line 2:* Mobile Number\n*Line 3:* Traffic Jam Location\n*Line 4:* Remarks\n\nPlease reply with all details.`,
            hindi: `🚦 *ट्रैफ़िक जाम रिपोर्ट*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* ट्रैफ़िक जाम का स्थान\n*पंक्ति 4:* टिप्पणी\n\nकृपया सभी विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_challan: {
            english: `🚦 *Traffic Challan Issues*\n\nYou can pay online at: www.echallan.parivahan.gov.in\n\nTo report an issue, please provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Mobile Number\n*Line 3:* Challan Number\n*Line 4:* Issue Details\n\nPlease reply with details.`,
            hindi: `🚦 *ट्रैफ़िक चालान मुद्दे*\n\nआप ऑनलाइन भुगतान कर सकते हैं: www.echallan.parivahan.gov.in\n\nसमस्या रिपोर्ट करने के लिए, कृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* चालान नंबर\n*पंक्ति 4:* समस्या विवरण\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
        sub_traffic_other: {
            english: `🚦 *Other Traffic Issues*\n\nPlease provide (one per line):\n\n*Line 1:* Name\n*Line 2:* Mobile Number\n*Line 3:* Interested Police Station\n*Line 4:* Issue Details\n\nPlease reply with details.`,
            hindi: `🚦 *अन्य यातायात समस्याएं*\n\nकृपया प्रदान करें (प्रति पंक्ति एक):\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* मोबाइल नंबर\n*पंक्ति 3:* संबंधित पुलिस स्टेशन\n*पंक्ति 4:* समस्या विवरण\n\nकृपया विवरण के साथ उत्तर दें।`,
        },
    };

    const message = formMessages[subServiceId];
    if (!message) {
        return getServiceMenu(language);
    }

    const cancelTip = language === 'english'
        ? '\n\n(Type "Menu" to cancel and go back)'
        : '\n\n(रद्द करने और वापस जाने के लिए "Menu" टाइप करें)';

    return {
        type: 'text',
        message: message[language] + cancelTip,
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
        message += `*Motor Vehicle Act Violations:*\n\n`;

        violations.forEach((v, index) => {
            message += `${index + 1}. *${v.crime}*\n`;
            message += `   Section: ${v.section}\n`;
            message += `   Penalty: ₹${v.penalty.toLocaleString()}\n\n`;
        });

        message += `\n📞 Traffic Police Station: 9296811585\n`;
        message += `📍 Location: 24.490654,86.691856\n\n`;
        message += `*Important Links:*\n`;
        message += `• Central Motor Vehicle Act, 1988\n`;
        message += `• Motor Vehicle Driving Regulation 2017\n`;
        message += `• Road Safety Signage & Signs\n`;
    } else {
        message = `🚦 *यातायात नियम और जुर्माना*\n\n`;
        message += `*मोटर वाहन अधिनियम उल्लंघन:*\n\n`;

        violations.forEach((v, index) => {
            message += `${index + 1}. *${v.crimeHindi}*\n`;
            message += `   धारा: ${v.section}\n`;
            message += `   जुर्माना: ₹${v.penalty.toLocaleString()}\n\n`;
        });

        message += `\n📞 ट्रैफ़िक पुलिस स्टेशन: 9296811585\n`;
        message += `📍 स्थान: 24.490654,86.691856\n\n`;
        message += `*महत्वपूर्ण लिंक:*\n`;
        message += `• केंद्रीय मोटर वाहन अधिनियम, 1988\n`;
        message += `• मोटर वाहन ड्राइविंग विनियम 2017\n`;
        message += `• सड़क सुरक्षा चिह्न और संकेत\n`;
    }

    return {
        type: 'text',
        message,
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

    // Sort by distance and get top 3
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestStations = stationsWithDistance.slice(0, 3);

    // Build response message
    let message = '';

    if (language === 'english') {
        message = `📍 *Nearest Police Stations to Your Location*\n\n`;

        nearestStations.forEach((item, index) => {
            const { station, distance } = item;
            message += `${index + 1}. *${station.name}*\n`;
            message += `   📞 ${station.contactNumber}\n`;
            message += `   📏 Distance: ${distance.toFixed(2)} km\n`;
            message += `   📍 Location: ${station.location.coordinates[1]},${station.location.coordinates[0]}\n`;
            if (station.inchargeName) {
                message += `   👮 Incharge: ${station.inchargeName}\n`;
            }
            message += `\n`;
        });

        message += `\n💡 *Tip:* You can click on the coordinates to open in Google Maps.`;
    } else {
        message = `📍 *आपके स्थान के निकटतम पुलिस स्टेशन*\n\n`;

        nearestStations.forEach((item, index) => {
            const { station, distance } = item;
            message += `${index + 1}. *${station.nameHindi}*\n`;
            message += `   📞 ${station.contactNumber}\n`;
            message += `   📏 दूरी: ${distance.toFixed(2)} किमी\n`;
            message += `   📍 स्थान: ${station.location.coordinates[1]},${station.location.coordinates[0]}\n`;
            if (station.inchargeNameHindi) {
                message += `   👮 प्रभारी: ${station.inchargeNameHindi}\n`;
            }
            message += `\n`;
        });

        message += `\n💡 *सुझाव:* आप Google Maps में खोलने के लिए निर्देशांक पर क्लिक कर सकते हैं।`;
    }

    return {
        type: 'text',
        message,
        language,
    };
}
