'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PoliceStationFormProps {
    initialData?: {
        _id?: string;
        name: string;
        nameHindi: string;
        address: string;
        addressHindi: string;
        district: string;
        contactNumber: string;
        inchargeName?: string;
        inchargeNameHindi?: string;
        latitude: number;
        longitude: number;
        isActive: boolean;
    };
}

export default function PoliceStationForm({ initialData }: PoliceStationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        nameHindi: initialData?.nameHindi || '',
        address: initialData?.address || '',
        addressHindi: initialData?.addressHindi || '',
        district: initialData?.district || 'Deoghar',
        contactNumber: initialData?.contactNumber || '',
        inchargeName: initialData?.inchargeName || '',
        inchargeNameHindi: initialData?.inchargeNameHindi || '',
        latitude: initialData?.latitude || 0,
        longitude: initialData?.longitude || 0,
        isActive: initialData?.isActive !== false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?._id
                ? `/api/police-stations/${initialData._id}`
                : '/api/police-stations';

            const response = await fetch(url, {
                method: initialData?._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard/police-stations');
                router.refresh();
            } else {
                alert('Error: ' + (data.error || 'Failed to save'));
            }
        } catch (error) {
            alert('Error saving police station');
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
                        Name (English) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Name (Hindi) *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.nameHindi}
                        onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address (English) *
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address (Hindi) *
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={formData.addressHindi}
                        onChange={(e) => setFormData({ ...formData, addressHindi: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contact Number *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        District
                    </label>
                    <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Latitude *
                    </label>
                    <input
                        type="number"
                        step="any"
                        required
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Longitude *
                    </label>
                    <input
                        type="number"
                        step="any"
                        required
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Incharge Name (English)
                    </label>
                    <input
                        type="text"
                        value={formData.inchargeName}
                        onChange={(e) => setFormData({ ...formData, inchargeName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Incharge Name (Hindi)
                    </label>
                    <input
                        type="text"
                        value={formData.inchargeNameHindi}
                        onChange={(e) => setFormData({ ...formData, inchargeNameHindi: e.target.value })}
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
                    {loading ? 'Saving...' : initialData?._id ? 'Update Station' : 'Create Station'}
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
