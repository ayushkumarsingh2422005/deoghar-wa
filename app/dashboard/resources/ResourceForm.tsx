'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResourceFormProps {
    initialData?: {
        _id?: string;
        type: string;
        title: string;
        titleHindi: string;
        content: string;
        contentHindi: string;
        url?: string;
        order: number;
        isActive: boolean;
    };
}

export default function ResourceForm({ initialData }: ResourceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: initialData?.type || 'disclaimer',
        title: initialData?.title || '',
        titleHindi: initialData?.titleHindi || '',
        content: initialData?.content || '',
        contentHindi: initialData?.contentHindi || '',
        url: initialData?.url || '',
        order: initialData?.order || 0,
        isActive: initialData?.isActive !== false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?._id
                ? `/api/resources/${initialData._id}`
                : '/api/resources';

            const response = await fetch(url, {
                method: initialData?._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard/resources');
                router.refresh();
            } else {
                alert('Error: ' + (data.error || 'Failed to save'));
            }
        } catch (error) {
            alert('Error saving resource');
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
                        Type *
                    </label>
                    <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                        <option value="disclaimer">Disclaimer</option>
                        <option value="important_link">Important Link</option>
                        <option value="cyber_info">Cyber Information</option>
                        <option value="traffic_info">Traffic Information</option>
                        <option value="general_info">General Information</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Order
                    </label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Title (English) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Title (Hindi) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.titleHindi}
                        onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Content (English) *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Content (Hindi) *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={formData.contentHindi}
                        onChange={(e) => setFormData({ ...formData, contentHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        URL (Optional)
                    </label>
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="https://example.com"
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
                    {loading ? 'Saving...' : initialData?._id ? 'Update Resource' : 'Create Resource'}
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
