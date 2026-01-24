import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResourceForm from '../../ResourceForm';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';

async function getResource(id: string) {
    await connectDB();
    const resource = await Resource.findById(id).lean();
    if (!resource) return null;

    return {
        _id: resource._id.toString(),
        type: resource.type,
        title: resource.title,
        titleHindi: resource.titleHindi,
        content: resource.content,
        contentHindi: resource.contentHindi,
        url: resource.url || '',
        order: resource.order,
        isActive: resource.isActive,
    };
}

export default async function EditResourcePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const resource = await getResource(id);

    if (!resource) {
        redirect('/dashboard/resources');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Edit Resource
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Update resource information
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <ResourceForm initialData={resource} />
            </div>
        </DashboardLayout>
    );
}
