'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrafficViolationFormProps {
    initialData?: {
        _id?: string;
        crime: string;
        crimeHindi: string;
        section: string;
        penalty: number;
        description?: string;
        descriptionHindi?: string;
        isActive: boolean;
    };
}

export default function TrafficViolationForm({ initialData }: TrafficViolationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        crime: initialData?.crime || '',
        crimeHindi: initialData?.crimeHindi || '',
        section: initialData?.section || '',
        penalty: initialData?.penalty || 0,
        description: initialData?.description || '',
        descriptionHindi: initialData?.descriptionHindi || '',
        isActive: initialData?.isActive !== false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?._id
                ? `/api/traffic-violations/${initialData._id}`
                : '/api/traffic-violations';

            const response = await fetch(url, {
                method: initialData?._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard/traffic-rules');
                router.refresh();
            } else {
                alert('Error: ' + (data.error || 'Failed to save'));
            }
        } catch (error) {
            alert('Error saving traffic rule');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Crime (English) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.crime}
                        onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Crime (Hindi) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.crimeHindi}
                        onChange={(e) => setFormData({ ...formData, crimeHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Section *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g., 179, 184(IV)(c)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Penalty (₹) *
                    </label>
                    <input
                        type="number"
                        required
                        value={formData.penalty}
                        onChange={(e) => setFormData({ ...formData, penalty: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description (English)
                    </label>
                    <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description (Hindi)
                    </label>
                    <textarea
                        rows={3}
                        value={formData.descriptionHindi}
                        onChange={(e) => setFormData({ ...formData, descriptionHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Active
                    </label>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : initialData?._id ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
