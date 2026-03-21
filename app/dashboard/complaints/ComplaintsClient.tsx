'use client';

import { useState, useMemo } from 'react';
import { Search, X, Clock, Loader2, CheckCircle2 } from 'lucide-react';

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

/* ─── Status sections config ─────────────────────────────────────────────── */

const STATUS_SECTIONS = [
    {
        value: 'pending',
        label: 'Pending',
        icon: Clock,
        headerClass: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
        borderClass: 'border-l-4 border-yellow-400',
        badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        countClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    },
    {
        value: 'in_progress',
        label: 'In Progress',
        icon: Loader2,
        headerClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
        borderClass: 'border-l-4 border-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        countClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
        value: 'resolved',
        label: 'Resolved',
        icon: CheckCircle2,
        headerClass: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
        borderClass: 'border-l-4 border-green-500',
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        countClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
];

/* ─── Status badge (inside cards) ───────────────────────────────────────── */

const statusBadge = (status: string) => {
    const base = 'text-xs px-2 py-0.5 rounded font-medium';
    if (status === 'resolved')    return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    if (status === 'in_progress') return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
    if (status === 'closed')      return `${base} bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300`;
    return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`;
};

/* ─── Highlight matching text ────────────────────────────────────────────── */

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-0.5">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

/* ─── Complaint Card ─────────────────────────────────────────────────────── */

function ComplaintCard({
    complaint,
    complaintTypeLabels,
    searchQuery,
}: {
    complaint: Complaint;
    complaintTypeLabels: Record<string, string>;
    searchQuery: string;
}) {
    return (
        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {complaint.complaintId && (
                            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold">
                                <Highlight text={complaint.complaintId} query={searchQuery} />
                            </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                            {complaintTypeLabels[complaint.complaintType] || complaint.complaintType}
                        </span>
                        <span className={statusBadge(complaint.status)}>
                            {complaint.status.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        <Highlight text={complaint.name} query={searchQuery} />
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        📞 <Highlight text={complaint.phoneNumber} query={searchQuery} />
                        {complaint.policeStation && ` · ${complaint.policeStation}`}
                    </p>
                    {complaint.remarks && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {complaint.remarks}
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                        {new Date(complaint.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
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

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ComplaintsClient({ complaints, groups, complaintTypeLabels }: Props) {
    const [searchQuery, setSearchQuery]       = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    /* Apply search + category filters */
    const filtered = useMemo(() => {
        let result = complaints;

        /* Category filter */
        if (categoryFilter !== 'all') {
            const group = groups.find(g => g.label === categoryFilter);
            if (group) result = result.filter(c => group.types.includes(c.complaintType));
        }

        /* Search filter — matches complaintId, name, or phone number */
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter(c =>
                (c.complaintId?.toLowerCase().includes(q)) ||
                c.name.toLowerCase().includes(q) ||
                c.phoneNumber.toLowerCase().includes(q)
            );
        }

        return result;
    }, [complaints, categoryFilter, searchQuery, groups]);

    const hasActiveFilters = categoryFilter !== 'all' || searchQuery.trim() !== '';

    const clearAll = () => {
        setSearchQuery('');
        setCategoryFilter('all');
    };

    const totalShown = filtered.length;

    return (
        <div>
            {/* ── Search + Filters ── */}
            <div className="space-y-3 mb-6">

                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        id="complaint-search"
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by Complaint ID, name, or phone number…"
                        className="w-full pl-9 pr-9 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category dropdown + result count */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            Category:
                        </label>
                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Categories</option>
                            {groups.map(g => {
                                const count = complaints.filter(c => g.types.includes(c.complaintType)).length;
                                return (
                                    <option key={g.label} value={g.label}>
                                        {g.label} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {totalShown} result{totalShown !== 1 ? 's' : ''}
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Three Status Sections ── */}
            <div className="space-y-8">
                {STATUS_SECTIONS.map(section => {
                    const Icon = section.icon;
                    const sectionComplaints = filtered.filter(c => c.status === section.value);

                    return (
                        <div
                            key={section.value}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden ${section.borderClass}`}
                        >
                            {/* Section header */}
                            <div className={`px-6 py-3 flex items-center justify-between ${section.headerClass}`}>
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <h2 className="font-semibold text-base">{section.label}</h2>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${section.countClass}`}>
                                    {sectionComplaints.length}
                                </span>
                            </div>

                            {/* Section body */}
                            {sectionComplaints.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                    {hasActiveFilters
                                        ? 'No matching complaints in this section.'
                                        : `No ${section.label.toLowerCase()} complaints.`}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sectionComplaints.map(complaint => (
                                        <ComplaintCard
                                            key={complaint._id}
                                            complaint={complaint}
                                            complaintTypeLabels={complaintTypeLabels}
                                            searchQuery={searchQuery}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* No results at all */}
                {totalShown === 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No complaints found</p>
                        <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
