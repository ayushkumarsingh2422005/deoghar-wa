import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TrafficViolation from '@/models/TrafficViolation';
import connectDB from '@/lib/db';
import { AlertCircle } from 'lucide-react';

async function getViolations() {
    await connectDB();
    const violations = await TrafficViolation.find({}).sort({ section: 1 }).lean();
    return violations.map(v => ({
        ...v,
        _id: v._id.toString(),
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
    }));
}

export default async function TrafficRulesPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const violations = await getViolations();

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Traffic Rules & Violations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">
                        Manage traffic violation penalties
                    </p>
                </div>
                <a
                    href="/dashboard/traffic-rules/new"
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                    Add New Rule
                </a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Section
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Crime (English)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Crime (Hindi)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Penalty (₹)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {violations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No traffic rules added yet. Click Add New Rule to create one.
                                    </td>
                                </tr>
                            ) : (
                                violations.map((violation) => (
                                    <tr key={violation._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                            {violation.section}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                            {violation.crime}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                            {violation.crimeHindi}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                            ₹{violation.penalty.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs font-medium ${violation.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {violation.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/dashboard/traffic-rules/edit/${violation._id}`}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                            >
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
