"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Data Structures ---

interface AnalyticsData {
    averageRating: number;
    totalSubmissions: number;
    distribution: { rating: number; count: number }[];
    subjectName?: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: number;
    userName?: string;
}

// --- Custom Tooltip Component (Prevents the Object-as-Child Error) ---
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-white text-sm">
                <p className="font-bold">Rating: {data.rating} Star</p>
                <p>Submissions: {data.count}</p>
            </div>
        );
    }
    return null;
};

// --- Main Chart Component ---
const RatingBarChart = ({ analytics }: { analytics: AnalyticsData }) => {
    const data = analytics.distribution.sort((a, b) => a.rating - b.rating);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Rating Distribution Breakdown</h3>
            <p className="text-4xl font-bold mb-4 text-center text-indigo-600">{analytics.averageRating} / 5.0</p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Total {analytics.totalSubmissions} Submissions</p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="rating" stroke="#6b7280" interval={0} />
                    <YAxis allowDecimals={false} stroke="#6b7280" />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Submission Count" radius={[10, 10, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main Page Component ---
const AnalyticsPage = () => {
    const params = useParams();
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    // Fetch analytics data (average, distribution, subject name)
    const { data: analytics, isPending: isAnalyticsPending, isError: isAnalyticsError } = useQuery<AnalyticsData>({
        queryKey: ['subjectAnalytics', subjectId],
        queryFn: async () => {
            const res = await axios.get(`/api/analytics/${subjectId}`);
            return res.data;
        },
        enabled: !!subjectId,
    });

    // Fetch individual reviews (including userName lookup)
    const { data: reviews, isPending: isReviewsPending } = useQuery<Review[]>({
        queryKey: ['subjectReviews', subjectId],
        queryFn: async () => {
            const res = await axios.get(`/api/reviews/${subjectId}`);
            return res.data;
        },
        enabled: !!subjectId,
    });


    // --- Loading and Error States ---
    if (isAnalyticsPending || isReviewsPending) return <div className="text-center py-20 text-xl">Loading Analytics...</div>;
    if (isAnalyticsError) return <div className="text-center py-20 text-red-500 text-xl">Error loading analytics. Check API route.</div>;

    // FIX: Use the fetched subjectName. If fetching failed or name is missing, use a fallback string
    const displaySubjectName = analytics?.subjectName || (subjectId ? `Subject ID: ${subjectId}` : 'Unknown Subject');


    if (!analytics || analytics.totalSubmissions === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-4">Analytics for {displaySubjectName}</h1>
                    <p className="text-gray-500">No feedback submitted for this subject yet.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="card-cta flex flex-col justify-center items-center mt-30 mx-50">
            <div className="container px-4 max-w-4xl mt-30 mx-50">
                {/* Display the full name retrieved from the API */}
                <h1 className="text-3xl font-bold mb-8">Analytics for {displaySubjectName}</h1>
                <RatingBarChart analytics={analytics} />

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">Recent Reviews ({reviews?.length || 0})</h2>

                    <div className="space-y-4">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">

                                        <div className="text-md font-bold text-gray-200">
                                            {/* Display name or fall back to a shortened ID */}
                                            {review.userName || `User ${review.userId.substring(0, 4)}`}

                                            {/* Display rating right next to the name */}
                                            <span className="ml-2 px-2 py-0.5 rounded-full  text-xs font-black text-white">
                                                {review.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Submitted: {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No text reviews found for this subject.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AnalyticsPage;
