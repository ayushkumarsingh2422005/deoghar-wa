import Complaint from '@/models/Complaint';
import Contact from '@/models/Contact';

/**
 * Validate form input based on complaint type
 */
export function validateFormInput(
    formType: string,
    userInput: string,
    language: 'english' | 'hindi'
): { isValid: boolean; errorMessage?: string; data?: Record<string, unknown> } {
    const lines = userInput.trim().split('\n').map(line => line.trim()).filter(line => line);

    // Passport delay validation
    if (formType === 'sub_passport_delay') {
        if (lines.length < 4) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide all required details in this format:\n\n*Line 1:* Name of Applicant\n*Line 2:* Passport Application Number\n*Line 3:* Concerned Police Station\n*Line 4:* Remarks\n\n*Example:*\nRahul Kumar\nAB1234567\nTown Thana\nVerification pending for 2 months\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया इस प्रारूप में सभी आवश्यक विवरण प्रदान करें:\n\n*पंक्ति 1:* आवेदक का नाम\n*पंक्ति 2:* पासपोर्ट आवेदन संख्या\n*पंक्ति 3:* संबंधित पुलिस स्टेशन\n*पंक्ति 4:* टिप्पणी\n\n*उदाहरण:*\nराहुल कुमार\nAB1234567\nनगर थाना\n2 महीने से सत्यापन लंबित\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                policeStation: lines[2],
                remarks: lines.slice(3).join(' '),
            },
        };
    }

    // Passport other issues
    if (formType === 'sub_passport_other') {
        if (lines.length < 4) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Concerned Police Station\n*Line 4:* Issue Details\n\n*Example:*\nPriya Sharma\nCD9876543\nTown Thana\nDocument submission issue\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* संबंधित पुलिस स्टेशन\n*पंक्ति 4:* समस्या विवरण\n\n*उदाहरण:*\nप्रिया शर्मा\nCD9876543\nनगर थाना\nदस्तावेज जमा करने में समस्या\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                policeStation: lines[2],
                remarks: lines.slice(3).join(' '),
            },
        };
    }

    // Petition issues
    if (formType.startsWith('sub_petition')) {
        if (lines.length < 5) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Concerned Police Station\n*Line 6:* Issue Details\n\n*Example:*\nAmit Singh\nRakesh Singh\nWard 5, Deoghar\n9876543210\nTown Thana\nDetail of your issue here\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* संबंधित पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\n*उदाहरण:*\nअमित सिंह\nराकेश सिंह\nवार्ड 5, देवघर\n9876543210\nनगर थाना\nअपनी समस्या का विवरण यहाँ लिखें\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                fatherName: lines[1],
                address: lines[2],
                policeStation: lines[4],
                remarks: `Contact No: ${lines[3]}\n\n${lines.slice(5).join(' ')}`,
            },
        };
    }

    // Suggestion/Review
    if (formType === 'suggestion_form') {
        if (lines.length < 2) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease simply provide:\n1. Your Name\n2. Your Suggestion/Review\n\n*Example:*\nRahul Kumar\nExcellent service by the traffic police team.\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया बस प्रदान करें:\n1. आपका नाम\n2. अपना सुझाव/समीक्षा\n\n*उदाहरण:*\nराहुल कुमार\nट्रैफिक पुलिस टीम द्वारा उत्कृष्ट सेवा।\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                content: lines.slice(1).join(' '),
            },
        };
    }

    // Traffic Jam
    if (formType === 'sub_traffic_jam') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Location\n4. Remarks\n\n*Example:*\nRajeev Kumar\n9876543210\nTower Chowk\nHeavy traffic jam for 1 hour\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. स्थान\n4. टिप्पणी\n\n*उदाहरण:*\nराजीव कुमार\n9876543210\nटावर चौक\n1 घंटे से भारी जाम है\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                location: lines[2],
                remarks: `Contact No: ${lines[1]}\n\n${lines.slice(3).join(' ')}`,
            },
        };
    }

    // Traffic Challan
    if (formType === 'sub_traffic_challan') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Challan Number\n4. Issue\n\n*Example:*\nSanjay Gupta\n9876543210\nJH12345678\nI was wearing a helmet but got challan\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. चालान नंबर\n4. समस्या\n\n*उदाहरण:*\nसंजय गुप्ता\n9876543210\nJH12345678\nमैंने हेलमेट पहना था पर चालान कट गया\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                challanNumber: lines[2],
                remarks: `Contact No: ${lines[1]}\n\n${lines.slice(3).join(' ')}`,
            },
        };
    }

    // Traffic Other
    if (formType === 'sub_traffic_other') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Station\n4. Issue\n\n*Example:*\nPooja Dey\n9876543210\nTraffic Thana\nTraffic light not working at Bajrangbali Chowk\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. स्टेशन\n4. समस्या\n\n*उदाहरण:*\nपूजा डे\n9876543210\nयातायात थाना\nबजरंगबली चौक पर ट्रैफिक लाइट खराब है\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                policeStation: lines[2],
                remarks: `Contact No: ${lines[1]}\n\n${lines.slice(3).join(' ')}`,
            },
        };
    }

    // Character delay
    if (formType === 'sub_character_delay') {
        if (lines.length < 5) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Application Date\n*Line 4:* Concerned Police Station\n*Line 5:* Remarks\n\n*Example:*\nSunil Verma\nCH12345\n12/03/2026\nTown Thana\nVerification delayed by 15 days\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* आवेदन तिथि\n*पंक्ति 4:* संबंधित पुलिस स्टेशन\n*पंक्ति 5:* टिप्पणी\n\n*उदाहरण:*\nसुनील वर्मा\nCH12345\n12/03/2026\nनगर थाना\nसत्यापन 15 दिनों से लंबित है\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                applicationDate: lines[2],
                policeStation: lines[3],
                remarks: lines.slice(4).join(' '),
            },
        };
    }

    // Character other
    if (formType === 'sub_character_other') {
        if (lines.length < 5) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Application Date\n*Line 4:* Concerned Police Station\n*Line 5:* Issue Details\n\n*Example:*\nSunil Verma\nCH12345\n12/03/2026\nTown Thana\nName misspelled in application\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* आवेदन तिथि\n*पंक्ति 4:* संबंधित पुलिस स्टेशन\n*पंक्ति 5:* समस्या विवरण\n\n*उदाहरण:*\nसुनील वर्मा\nCH12345\n12/03/2026\nनगर थाना\nआवेदन में नाम की वर्तनी गलत है\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                applicationDate: lines[2],
                policeStation: lines[3],
                remarks: lines.slice(4).join(' '),
            },
        };
    }

    // Lost Mobile (only "Not Satisfied" is handled here; "Report Lost Mobile" redirects to CEIR portal)
    if (formType === 'sub_lost_mobile_not_satisfied') {
        if (lines.length < 6) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Lost Mobile Number\n*Line 6:* Concerned Police Station\n\n*Example:*\nSanjay Sharma\nRahul Sharma\nWilliams Town\n9876543210\n9876543211\nTown Thana\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* खोया मोबाइल नंबर\n*पंक्ति 6:* संबंधित पुलिस स्टेशन\n\n*उदाहरण:*\nसंजय शर्मा\nराहुल शर्मा\nविलियम्स टाउन\n9876543210\n9876543211\nनगर थाना\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                fatherName: lines[1],
                address: lines[2],
                lostMobileNumber: lines[4],
                policeStation: lines[5],
                remarks: `Contact No: ${lines[3]}\n\n${lines.slice(6).join(' ')}`, // If they provide extra info
            },
        };
    }

    // Cyber Crime (only "Other Issues" is handled here; "Report Cyber Crime" redirects to cybercrime.gov.in / 1930)
    if (formType === 'sub_cyber_other') {
        if (lines.length < 6) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Concerned Police Station\n*Line 6:* Issue Details\n\n*Example:*\nKamal Roy\nBijay Roy\nBompas Town\n9876543210\nCyber Thana\nAmount fraudulently deducted from my account\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* संबंधित पुलिस स्टेशन\n*पंक्ति 6:* मुद्दे का विवरण\n\n*उदाहरण:*\nकमल रॉय\nबिजय रॉय\nबोम्पस टाउन\n9876543210\nसाइबर थाना\nमेरे खाते से धोखाधड़ी से पैसे काटे गए\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                fatherName: lines[1],
                address: lines[2],
                policeStation: lines[4],
                remarks: `Contact No: ${lines[3]}\n\n${lines.slice(5).join(' ')}`,
            },
        };
    }

    // Default
    return {
        isValid: true,
        data: {
            name: lines[0] || 'Not provided',
            remarks: userInput,
        },
    };
}

/**
 * Save complaint to database
 */
export async function saveComplaint(
    phoneNumber: string,
    complaintType: string,
    data: Record<string, unknown>
): Promise<string | null> {
    // Import database connection
    const connectDB = (await import('./db')).default;
    await connectDB();

    // Check if it's a review/suggestion
    if (complaintType === 'suggestion_form') {
        const Review = (await import('@/models/Review')).default;
        await Review.create({
            phoneNumber,
            name: String(data.name || ''),
            content: String(data.content || ''),
            status: 'pending',
        });
        return null;
    }

    // Convert sub_xxx to xxx format for database
    const dbComplaintType = complaintType.replace('sub_', '');

    const complaint = await Complaint.create({
        phoneNumber,
        complaintType: dbComplaintType,
        ...data,
        status: 'pending',
    });

    // complaintId is set by the pre-save hook
    return complaint.complaintId || null;
}

/**
 * Handle form submission
 */
export async function handleFormSubmission(
    phoneNumber: string,
    userInput: string,
    flowState: { step: string; data?: Record<string, unknown> }
): Promise<{
    success: boolean;
    message: string;
    language: 'english' | 'hindi';
    sendFollowUpMenu?: boolean;
}> {
    // Import database connection
    const connectDB = (await import('./db')).default;
    await connectDB();

    const contact = await Contact.findOne({ phoneNumber });
    const language = contact?.language || 'english';

    // Validate input
    const validationResult = validateFormInput(flowState.step, userInput, language);

    if (!validationResult.isValid) {
        return {
            success: false,
            message: validationResult.errorMessage || '',
            language,
        };
    }

    // Save to database
    try {
        const complaintId = await saveComplaint(phoneNumber, flowState.step, validationResult.data || {});

        // Success message
        if (flowState.step === 'suggestion_form') {
            if (language === 'english') {
                return {
                    success: true,
                    message: `✅ *Suggestion/Review Submitted*\n\nThank you for your valuable suggestion/review. We appreciate your input!`,
                    language,
                    sendFollowUpMenu: true,
                };
            } else {
                return {
                    success: true,
                    message: `✅ *सुझाव/समीक्षा जमा की गई*\n\nआपके बहुमूल्य सुझाव/समीक्षा के लिए धन्यवाद। हम इसकी सराहना करते हैं!`,
                    language,
                    sendFollowUpMenu: true,
                };
            }
        }

        const idLine = complaintId
            ? language === 'english'
                ? `\n\n🆔 *Complaint ID: ${complaintId}*\n_Please save this ID to track your complaint._`
                : `\n\n🆔 *शिकायत आईडी: ${complaintId}*\n_इस आईडी को सुरक्षित रखें, आपकी शिकायत ट्रैक करने के काम आएगी।_`
            : '';

        if (language === 'english') {
            return {
                success: true,
                message: `✅ *Complaint Registered Successfully*\n\nYour complaint has been registered. Our team will review it and take appropriate action.${idLine}\n\nYou will be contacted soon. Thank you for your patience.`,
                language,
                sendFollowUpMenu: true,
            };
        } else {
            return {
                success: true,
                message: `✅ *शिकायत सफलतापूर्वक दर्ज*\n\nआपकी शिकायत दर्ज कर ली गई है। हमारी टीम इसकी समीक्षा करेगी और उचित कार्रवाई करेगी।${idLine}\n\nजल्द ही आपसे संपर्क किया जाएगा। आपके धैर्य के लिए धन्यवाद।`,
                language,
                sendFollowUpMenu: true,
            };
        }
    } catch (error) {
        console.error('Error saving complaint:', error);

        if (language === 'english') {
            return {
                success: false,
                message: `❌ *Error*\n\nSorry, there was an error saving your complaint. Please try again later or contact us directly.`,
                language,
            };
        } else {
            return {
                success: false,
                message: `❌ *त्रुटि*\n\nक्षमा करें, आपकी शिकायत सहेजने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें या हमसे सीधे संपर्क करें।`,
                language,
            };
        }
    }
}
