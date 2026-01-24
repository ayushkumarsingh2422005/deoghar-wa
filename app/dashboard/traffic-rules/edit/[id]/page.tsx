import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TrafficViolationForm from '../../TrafficViolationForm';
import connectDB from '@/lib/db';
import TrafficViolation from '@/models/TrafficViolation';

async function getViolation(id: string) {
    await connectDB();
    const violation = await TrafficViolation.findById(id).lean();
    if (!violation) return null;

    return {
        _id: violation._id.toString(),
        crime: violation.crime,
        crimeHindi: violation.crimeHindi,
        section: violation.section,
        penalty: violation.penalty,
        description: violation.description || '',
        descriptionHindi: violation.descriptionHindi || '',
        isActive: violation.isActive,
    };
}

export default async function EditTrafficRulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const violation = await getViolation(id);

    if (!violation) {
        redirect('/dashboard/traffic-rules');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Edit Traffic Rule
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Update traffic violation information
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <TrafficViolationForm initialData={violation} />
            </div>
        </DashboardLayout>
    );
}
