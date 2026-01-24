import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TestWhatsAppClient from './TestWhatsAppClient';

export default async function TestWhatsAppPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Test WhatsApp API
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Test your WhatsApp integration by sending messages manually
                </p>
            </div>

            <TestWhatsAppClient />
        </DashboardLayout>
    );
}
