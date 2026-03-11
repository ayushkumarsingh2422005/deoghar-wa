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
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide all required details in this format:\n\n*Line 1:* Name of Applicant\n*Line 2:* Passport Application Number\n*Line 3:* Remarks\n\n*Example:*\nRahul Kumar\nAB1234567\nVerification pending for 2 months\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया इस प्रारूप में सभी आवश्यक विवरण प्रदान करें:\n\n*पंक्ति 1:* आवेदक का नाम\n*पंक्ति 2:* पासपोर्ट आवेदन संख्या\n*पंक्ति 3:* टिप्पणी\n\n*उदाहरण:*\nराहुल कुमार\nAB1234567\n2 महीने से सत्यापन लंबित\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                remarks: lines.slice(2).join(' '),
            },
        };
    }

    // Passport other issues
    if (formType === 'sub_passport_other') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Name\n*Line 2:* Application Number\n*Line 3:* Issue Details\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* नाम\n*पंक्ति 2:* आवेदन संख्या\n*पंक्ति 3:* समस्या विवरण\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                applicationNumber: lines[1],
                remarks: lines.slice(2).join(' '),
            },
        };
    }

    // Petition issues
    if (formType.startsWith('sub_petition')) {
        if (lines.length < 5) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n\n*Line 1:* Your Name\n*Line 2:* Father's Name\n*Line 3:* Address\n*Line 4:* Mobile Number\n*Line 5:* Concerned Police Station\n*Line 6:* Issue Details\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n\n*पंक्ति 1:* आपका नाम\n*पंक्ति 2:* पिता का नाम\n*पंक्ति 3:* पता\n*पंक्ति 4:* मोबाइल नंबर\n*पंक्ति 5:* संबंधित पुलिस स्टेशन\n*पंक्ति 6:* समस्या विवरण\n\nकृपया पुनः प्रयास करें।`,
            };
        }

        return {
            isValid: true,
            data: {
                name: lines[0],
                fatherName: lines[1],
                address: lines[2],
                policeStation: lines[4],
                remarks: lines.slice(5).join(' '),
            },
        };
    }

    // Suggestion/Review
    if (formType === 'suggestion_form') {
        if (lines.length < 2) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease simply provide:\n1. Your Name\n2. Your Review/Suggestion\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया बस प्रदान करें:\n1. आपका नाम\n2. आपकी समीक्षा/सुझाव\n\nकृपया पुनः प्रयास करें।`,
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
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Location\n4. Remarks\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. स्थान\n4. टिप्पणी\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                lostMobileNumber: lines[1], // storing mobile in lostMobileNumber field or create new one? reuse existing
                location: lines[2],
                remarks: lines.slice(3).join(' '),
            },
        };
    }

    // Traffic Challan
    if (formType === 'sub_traffic_challan') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Challan Number\n4. Issue\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. चालान नंबर\n4. समस्या\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                lostMobileNumber: lines[1],
                challanNumber: lines[2],
                remarks: lines.slice(3).join(' '),
            },
        };
    }

    // Traffic Other
    if (formType === 'sub_traffic_other') {
        if (lines.length < 3) {
            return {
                isValid: false,
                errorMessage: language === 'english'
                    ? `❌ *Incomplete Information*\n\nPlease provide:\n1. Name\n2. Mobile Number\n3. Station\n4. Issue\n\nPlease try again.`
                    : `❌ *अधूरी जानकारी*\n\nकृपया प्रदान करें:\n1. नाम\n2. मोबाइल नंबर\n3. स्टेशन\n4. समस्या\n\nकृपया पुनः प्रयास करें।`,
            };
        }
        return {
            isValid: true,
            data: {
                name: lines[0],
                lostMobileNumber: lines[1],
                policeStation: lines[2],
                remarks: lines.slice(3).join(' '),
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
) {
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
        return;
    }

    // Convert sub_xxx to xxx format for database
    const dbComplaintType = complaintType.replace('sub_', '');

    await Complaint.create({
        phoneNumber,
        complaintType: dbComplaintType,
        ...data,
        status: 'pending',
    });
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
        await saveComplaint(phoneNumber, flowState.step, validationResult.data || {});

        // Success message
        if (flowState.step === 'suggestion_form') {
            if (language === 'english') {
                return {
                    success: true,
                    message: `✅ *Review Submitted*\n\nThank you for your valuable feedback/review. We appreciate your input!`,
                    language,
                    sendFollowUpMenu: true,
                };
            } else {
                return {
                    success: true,
                    message: `✅ *समीक्षा जमा की गई*\n\nआपकी बहुमूल्य प्रतिक्रिया/समीक्षा के लिए धन्यवाद। हम आपके सुझाव की सराहना करते हैं!`,
                    language,
                    sendFollowUpMenu: true,
                };
            }
        }

        if (language === 'english') {
            return {
                success: true,
                message: `✅ *Complaint Registered Successfully*\n\nYour complaint has been registered. Our team will review it and take appropriate action.\n\nComplaint ID: ${Date.now()}\n\nYou will be contacted soon.\n\nThank you for your patience.`,
                language,
                sendFollowUpMenu: true,
            };
        } else {
            return {
                success: true,
                message: `✅ *शिकायत सफलतापूर्वक दर्ज*\n\nआपकी शिकायत दर्ज कर ली गई है। हमारी टीम इसकी समीक्षा करेगी और उचित कार्रवाई करेगी।\n\nशिकायत आईडी: ${Date.now()}\n\nजल्द ही आपसे संपर्क किया जाएगा।\n\nआपके धैर्य के लिए धन्यवाद।`,
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
