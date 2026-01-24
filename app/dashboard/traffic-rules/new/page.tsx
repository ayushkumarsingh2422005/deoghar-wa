import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TrafficViolationForm from '../TrafficViolationForm';

export default async function NewTrafficRulePage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Add New Traffic Rule
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Create a new traffic violation entry
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <TrafficViolationForm />
            </div>
        </DashboardLayout>
    );
}
