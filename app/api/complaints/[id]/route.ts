import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import Contact from '@/models/Contact';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        await connectDB();

        const updateData: Record<string, string> = { status: data.status };
        if (data.assignedTo) updateData.assignedTo = data.assignedTo;
        if (data.status === 'resolved') updateData.resolvedAt = new Date().toISOString();

        const complaint = await Complaint.findByIdAndUpdate(id, updateData, { new: true });
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // When resolved, notify the complainant via WhatsApp
        if (data.status === 'resolved' && complaint.phoneNumber) {
            try {
                const contact = await Contact.findOne({ phoneNumber: complaint.phoneNumber });
                const language = contact?.language || 'english';
                const cid = complaint.complaintId || id;

                const message = language === 'english'
                    ? `✅ *Your Complaint Has Been Resolved*\n\n🆔 Complaint ID: *${cid}*\n\nDear ${complaint.name},\n\nWe are pleased to inform you that your complaint registered with Deoghar Police has been resolved.\n\nIf you are still facing issues, please contact us again or call *112*.\n\n_Deoghar Police Official WhatsApp Chatbot_`
                    : `✅ *आपकी शिकायत हल हो गई है*\n\n🆔 शिकायत आईडी: *${cid}*\n\nप्रिय ${complaint.name},\n\nहमें यह सूचित करते हुए प्रसन्नता है कि देवघर पुलिस में दर्ज आपकी शिकायत का समाधान कर दिया गया है।\n\nयदि आप अभी भी समस्या का सामना कर रहे हैं, तो कृपया फिर से हमसे संपर्क करें या *112* पर कॉल करें।\n\n_देवघर पुलिस आधिकारिक व्हाट्सएप चैटबॉट_`;

                await sendWhatsAppMessage({ to: complaint.phoneNumber, text: message });
            } catch (notifyErr) {
                // Non-critical — log but don't fail the request
                console.error('Failed to send resolution notification:', notifyErr);
            }
        }

        return NextResponse.json({ success: true, complaint });
    } catch (error) {
        console.error('Error updating complaint:', error);
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}
