'use client';

import { useState } from 'react';

interface Complaint {
    _id: string;
    complaintId?: string | null;
    complaintType: string;
    name: string;
    phoneNumber: string;
    policeStation?: string;
    remarks?: string;
    status: string;
    createdAt: string;
}

interface Group {
    label: string;
    color: string;
    types: string[];
}

interface Props {
    complaints: Complaint[];
    groups: Group[];
    complaintTypeLabels: Record<string, string>;
}

const statusBadge = (status: string) => {
    const base = 'text-xs px-2 py-0.5 rounded font-medium';
    if (status === 'resolved')   return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    if (status === 'in_progress') return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
    if (status === 'closed')      return `${base} bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300`;
    return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`;
};

const groupColorClasses: Record<string, string> = {
    indigo: 'border-l-4 border-indigo-500',
    violet: 'border-l-4 border-violet-500',
    blue:   'border-l-4 border-blue-500',
    orange: 'border-l-4 border-orange-500',
    yellow: 'border-l-4 border-yellow-500',
    red:    'border-l-4 border-red-500',
    green:  'border-l-4 border-green-500',
};

const groupHeaderClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-800 dark:text-violet-300',
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
};

function ComplaintCard({
    complaint,
    complaintTypeLabels,
}: {
    complaint: Complaint;
    complaintTypeLabels: Record<string, string>;
}) {
    return (
        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {complaint.complaintId && (
                            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold">
                                {complaint.complaintId}
                            </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            {complaintTypeLabels[complaint.complaintType] || complaint.complaintType}
                        </span>
                        <span className={statusBadge(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {complaint.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        📞 {complaint.phoneNumber}
                        {complaint.policeStation && ` · ${complaint.policeStation}`}
                    </p>
                    {complaint.remarks && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {complaint.remarks}
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                        {new Date(complaint.createdAt).toLocaleString('en-IN')}
                    </p>
                </div>
                <a
                    href={`/dashboard/complaints/${complaint._id}`}
                    className="shrink-0 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                    View →
                </a>
            </div>
        </div>
    );
}

export default function ComplaintsClient({ complaints, groups, complaintTypeLabels }: Props) {
    // 'all' means show all groups. Otherwise holds the group label.
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const filteredGroups = activeFilter === 'all'
        ? groups
        : groups.filter(g => g.label === activeFilter);

    const totalShown = filteredGroups.reduce((acc, g) => {
        return acc + complaints.filter(c => g.types.includes(c.complaintType)).length;
    }, 0);

    return (
        <div>
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Filter by Category:
                </label>
                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full sm:w-72 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Categories ({complaints.length})</option>
                    {groups.map(g => {
                        const count = complaints.filter(c => g.types.includes(c.complaintType)).length;
                        return (
                            <option key={g.label} value={g.label}>
                                {g.label} ({count})
                            </option>
                        );
                    })}
                </select>
                {activeFilter !== 'all' && (
                    <button
                        onClick={() => setActiveFilter('all')}
                        className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
                    >
                        Clear filter
                    </button>
                )}
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    Showing {totalShown} complaint{totalShown !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Groups */}
            <div className="space-y-8">
                {filteredGroups.map((group) => {
                    const groupComplaints = complaints.filter(c =>
                        group.types.includes(c.complaintType)
                    );
                    if (groupComplaints.length === 0) return null;

                    return (
                        <div
                            key={group.label}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden ${groupColorClasses[group.color]}`}
                        >
                            <div className={`px-6 py-3 flex items-center justify-between ${groupHeaderClasses[group.color]}`}>
                                <h2 className="font-semibold text-base">{group.label}</h2>
                                <span className="text-xs font-medium opacity-75">
                                    {groupComplaints.length} complaint{groupComplaints.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {groupComplaints.map(complaint => (
                                    <ComplaintCard
                                        key={complaint._id}
                                        complaint={complaint}
                                        complaintTypeLabels={complaintTypeLabels}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {totalShown === 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                        No complaints found for this filter.
                    </div>
                )}
            </div>
        </div>
    );
}
