import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Complaint from '@/models/Complaint';
import connectDB from '@/lib/db';
import ComplaintDetailClient from './ComplaintDetailClient';
import Link from 'next/link';

const complaintTypeLabels: Record<string, string> = {
    passport_delay: 'Passport - Delay in Verification',
    passport_other: 'Passport - Other Issues',
    character_delay: 'Character Verification - Delay',
    character_other: 'Character Verification - Other',
    petition_not_visited: 'Petition - Police Not Visited',
    petition_not_satisfied: 'Petition - Not Satisfied',
    petition_other: 'Petition - Other Issues',
    lost_mobile: 'Lost Mobile Phone',
    lost_mobile_not_satisfied: 'Lost Mobile - Not Satisfied',
    traffic_jam: 'Traffic - Jam',
    traffic_challan: 'Traffic - Challan',
    traffic_other: 'Traffic - Other',
    cyber: 'Cyber Crime',
    cyber_other: 'Cyber Crime - Other',
    suggestion: 'Suggestion',
};

async function getComplaint(id: string) {
    await connectDB();
    const complaint = await Complaint.findById(id).lean();
    if (!complaint) return null;

    return {
        ...complaint,
        _id: complaint._id.toString(),
        complaintId: complaint.complaintId || null,
        createdAt: complaint.createdAt.toISOString(),
        updatedAt: complaint.updatedAt.toISOString(),
        resolvedAt: complaint.resolvedAt?.toISOString(),
    };
}

export default async function ComplaintDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const complaint = await getComplaint(id);

    if (!complaint) {
        redirect('/dashboard/complaints');
    }

    return (
        <DashboardLayout username={session.username as string}>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/dashboard/complaints"
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                        ← Back to Complaints
                    </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                    Complaint Details
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    {complaint.complaintId && (
                        <span className="font-mono text-base font-semibold px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded">
                            🆔 {complaint.complaintId}
                        </span>
                    )}
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {complaintTypeLabels[complaint.complaintType]}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Complaint Information
                        </h2>

                        <div className="space-y-4">
                            {complaint.complaintId && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-200 dark:border-indigo-800">
                                    <label className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide font-semibold">Complaint ID</label>
                                    <p className="text-indigo-900 dark:text-indigo-100 font-mono font-bold text-lg mt-0.5">{complaint.complaintId}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400">Type</label>
                                <p className="text-slate-900 dark:text-white font-medium">
                                    {complaintTypeLabels[complaint.complaintType]}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400">Name</label>
                                <p className="text-slate-900 dark:text-white font-medium">{complaint.name}</p>
                            </div>

                            {complaint.fatherName && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Father&apos;s Name</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.fatherName}</p>
                                </div>
                            )}

                            {complaint.address && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Address</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.address}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-slate-500 dark:text-slate-400">Phone Number</label>
                                <p className="text-slate-900 dark:text-white font-medium">{complaint.phoneNumber}</p>
                            </div>

                            {complaint.applicationNumber && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Application Number</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.applicationNumber}</p>
                                </div>
                            )}

                            {complaint.policeStation && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Concerned Police Station</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.policeStation}</p>
                                </div>
                            )}

                            {complaint.lostMobileNumber && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Lost Mobile Number</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.lostMobileNumber}</p>
                                </div>
                            )}

                            {complaint.challanNumber && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Challan Number</label>
                                    <p className="text-slate-900 dark:text-white">{complaint.challanNumber}</p>
                                </div>
                            )}

                            {complaint.remarks && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Remarks</label>
                                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{complaint.remarks}</p>
                                </div>
                            )}

                            {complaint.suggestion && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">Suggestion</label>
                                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{complaint.suggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Status
                        </h2>

                        <ComplaintDetailClient
                            complaintId={complaint._id}
                            currentStatus={complaint.status}
                            assignedTo={complaint.assignedTo || ''}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Timeline
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Submitted</p>
                                <p className="text-slate-900 dark:text-white">
                                    {new Date(complaint.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Last Updated</p>
                                <p className="text-slate-900 dark:text-white">
                                    {new Date(complaint.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>

                            {complaint.resolvedAt && (
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">Resolved</p>
                                    <p className="text-slate-900 dark:text-white">
                                        {new Date(complaint.resolvedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
