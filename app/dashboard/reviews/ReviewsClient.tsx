'use client';

import { useState, useEffect } from 'react';
import { Star, AlertCircle, Loader2 } from 'lucide-react';

interface Review {
    _id: string;
    phoneNumber: string;
    name: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ReviewsClient() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError('Failed to load reviews');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        Reviews & Suggestions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View feedback and suggestions from users
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 text-center border border-slate-200 dark:border-slate-700">
                    <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No reviews found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        User reviews and suggestions will appear here.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Review/Suggestion</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {review.name}
                                            </div>
                                            <div className="text-xs mt-1">
                                                {review.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="whitespace-pre-wrap">{review.content}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${review.status === 'approved'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : review.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                            <div className="text-xs mt-0.5">
                                                {new Date(review.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
