import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import ChatView from './ChatView';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/chats">
                        <Button variant="secondary" className="py-2! px-4! text-sm">
                            ← Back
                        </Button>
                    </Link>
                    <div>
                        <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                            {phoneNumber}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            WhatsApp Conversation
                        </p>
                    </div>
                </div>
            </nav>

            <ChatView phoneNumber={phoneNumber} />
        </div>
    );
}
