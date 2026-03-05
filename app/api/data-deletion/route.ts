import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import Contact from '@/models/Contact';
import Review from '@/models/Review';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone, reason } = body;

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json(
                { error: 'A valid phone number is required.' },
                { status: 400 }
            );
        }

        // Normalise the phone number – strip spaces and dashes
        const normalised = phone.replace(/[\s\-().]/g, '');

        // Basic validation: must start with + and contain digits
        if (!/^\+\d{7,15}$/.test(normalised)) {
            return NextResponse.json(
                { error: 'Please provide a valid phone number in international format (e.g. +919876543210).' },
                { status: 400 }
            );
        }

        await connectDB();

        // Log the deletion request for audit purposes (optional – can be removed if full deletion is required)
        console.log(
            `[Data Deletion Request] Phone: ${normalised} | Reason: ${reason || 'Not provided'} | Time: ${new Date().toISOString()}`
        );

        // Delete chat messages
        const chatResult = await ChatMessage.deleteMany({ phoneNumber: normalised });

        // Delete contact profile
        const contactResult = await Contact.deleteOne({ phoneNumber: normalised });

        // Delete reviews associated with this phone number (if the field exists)
        let reviewsDeleted = 0;
        try {
            const reviewResult = await Review.deleteMany({ phoneNumber: normalised });
            reviewsDeleted = reviewResult.deletedCount ?? 0;
        } catch {
            // Review model may not have a phoneNumber field – ignore
        }

        const deleted = {
            messages: chatResult.deletedCount ?? 0,
            contact: contactResult.deletedCount ?? 0,
            reviews: reviewsDeleted,
        };

        const anyDeleted = Object.values(deleted).some((v) => v > 0);

        return NextResponse.json({
            success: true,
            message: anyDeleted
                ? `Your data has been deleted successfully. Removed: ${deleted.messages} message(s), ${deleted.contact} contact record(s), ${deleted.reviews} review(s).`
                : 'No data was found associated with the provided phone number. It may have already been deleted or was never stored.',
            deleted,
        });
    } catch (error) {
        console.error('[Data Deletion API Error]', error);
        return NextResponse.json(
            { error: 'An internal server error occurred. Please try again later or contact us directly.' },
            { status: 500 }
        );
    }
}
