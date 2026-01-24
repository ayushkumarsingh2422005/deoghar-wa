import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Resource from '@/models/Resource';
import connectDB from '@/lib/db';

async function getResources() {
    await connectDB();
    const resources = await Resource.find({}).sort({ type: 1, order: 1 }).lean();
    return resources.map(r => ({
        ...r,
        _id: r._id.toString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));
}

const typeLabels: Record<string, string> = {
    important_link: 'Important Link',
    disclaimer: 'Disclaimer',
    cyber_info: 'Cyber Information',
    traffic_info: 'Traffic Information',
    general_info: 'General Information',
};

export default async function ResourcesPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const resources = await getResources();

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Resources & Information
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">
                        Manage disclaimers, links, and information
                    </p>
                </div>
                <a
                    href="/dashboard/resources/new"
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                    Add New Resource
                </a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {resources.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            No resources added yet. Click Add New Resource to create one.
                        </div>
                    ) : (
                        resources.map((resource) => (
                            <div key={resource._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {resource.title}
                                            </h3>
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {typeLabels[resource.type]}
                                            </span>
                                            <span className={`text-xs px-2 py-1 ${resource.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                }`}>
                                                {resource.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            {resource.titleHindi}
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                            {resource.content.substring(0, 150)}...
                                        </p>
                                        {resource.url && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                Link: {resource.url}
                                            </p>
                                        )}
                                    </div>
                                    <a
                                        href={`/dashboard/resources/edit/${resource._id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 ml-4"
                                    >
                                        Edit
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
