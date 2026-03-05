'use client';

import { useState } from 'react';

export default function DataDeletionForm() {
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/data-deletion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, reason }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Your deletion request has been received. We will process it within 30 days.');
                setPhone('');
                setReason('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again or email us directly.');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please check your connection and try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <p className="text-xs text-slate-400 mt-1">Include country code (e.g. +91 for India)</p>
            </div>

            <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Deletion <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                    id="reason"
                    rows={3}
                    placeholder="Let us know why you want your data deleted..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
                />
            </div>

            {/* Status messages */}
            {status === 'success' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200 text-sm">
                    ✅ {message}
                </div>
            )}
            {status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200 text-sm">
                    ❌ {message}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                {status === 'loading' ? 'Submitting…' : 'Submit Deletion Request'}
            </button>
        </form>
    );
}
