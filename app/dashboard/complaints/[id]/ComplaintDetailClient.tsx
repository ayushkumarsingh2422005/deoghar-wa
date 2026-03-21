'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ComplaintDetailClientProps {
    complaintId: string;
    currentStatus: string;
    assignedTo: string;
}

export default function ComplaintDetailClient({
    complaintId,
    currentStatus,
    assignedTo,
}: ComplaintDetailClientProps) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [assigned, setAssigned] = useState(assignedTo);
    const [saving, setSaving] = useState(false);

    const handleUpdateStatus = async () => {
        setSaving(true);

        try {
            const response = await fetch(`/api/complaints/${complaintId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, assignedTo: assigned }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Complaint updated successfully!');
                router.refresh();
            } else {
                alert('Error: ' + (data.error || 'Failed to update'));
            }
        } catch (error) {
            alert('Error updating complaint');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Assigned To
                </label>
                <input
                    type="text"
                    value={assigned}
                    onChange={(e) => setAssigned(e.target.value)}
                    placeholder="Officer name/ID"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
            </div>

            <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="w-full px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                {saving ? 'Updating...' : 'Update Status'}
            </button>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className={`px-3 py-2 text-sm text-center ${
                        status === 'resolved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {status.replace('_', ' ').toUpperCase()}
                </div>
            </div>
        </div>
    );
}
