import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ContactsList from './ContactsList';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function ChatsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    WhatsApp Chats
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    View and manage all your WhatsApp conversations in one place
                </p>
            </div>

            <ContactsList />
        </DashboardLayout>
    );
}
