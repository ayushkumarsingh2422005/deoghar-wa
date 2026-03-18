import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Complaint from '@/models/Complaint';
import connectDB from '@/lib/db';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

async function getComplaints() {
    await connectDB();
    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return complaints.map(c => ({
        ...c,
        _id: c._id.toString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        resolvedAt: c.resolvedAt?.toISOString(),
    }));
}

const complaintTypeLabels: Record<string, string> = {
    passport_delay: 'Passport - Delay',
    passport_other: 'Passport - Other',
    character_delay: 'Character Verification - Delay',
    character_other: 'Character Verification - Other',
    petition_not_visited: 'Petition - Police Not Visited',
    petition_not_satisfied: 'Petition - Not Satisfied',
    petition_other: 'Petition - Other',
    lost_mobile: 'Lost Mobile Phone',
    lost_mobile_not_satisfied: 'Lost Mobile - Not Satisfied',
    traffic_jam: 'Traffic - Jam',
    traffic_challan: 'Traffic - Challan',
    traffic_other: 'Traffic - Other',
    cyber: 'Cyber Crime',
    cyber_other: 'Cyber Crime - Other',
    suggestion: 'Suggestion',
};

export default async function ComplaintsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const complaints = await getComplaints();
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        inProgress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Complaints & Reports
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Manage citizen complaints and suggestions
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {complaints.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            No complaints yet
                        </div>
                    ) : (
                        complaints.map((complaint) => (
                            <div key={complaint._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {complaintTypeLabels[complaint.complaintType]}
                                            </span>
                                            <span className={`text-xs px-2 py-1 ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                                    complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                                }`}>
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                            {complaint.name}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            Phone: {complaint.phoneNumber}
                                        </p>
                                        {complaint.remarks && (
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                                {complaint.remarks}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            Submitted: {new Date(complaint.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <a
                                        href={`/dashboard/complaints/${complaint._id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                    >
                                        View Details
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
