import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChatView from './ChatView';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function ChatDetailPage({
    params,
}: {
    params: Promise<{ phoneNumber: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    // Await params in Next.js 15+
    const { phoneNumber: encodedPhoneNumber } = await params;
    const phoneNumber = decodeURIComponent(encodedPhoneNumber);

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {phoneNumber}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    WhatsApp Conversation
                </p>
            </div>

            <ChatView phoneNumber={phoneNumber} />
        </DashboardLayout>
    );
}
