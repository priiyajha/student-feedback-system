"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Data Structures ---

interface AnalyticsData {
    averageRating: number;
    totalSubmissions: number;
    // Data structure for Recharts: [{ rating: 1, count: 5 }, { rating: 2, count: 3 }, ...]
    distribution: { rating: number; count: number }[];
}

// --- Custom Tooltip Component (Prevents the Object-as-Child Error) ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Find the rating and count from the payload data
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

    // Data needs to be sorted for a clean bar chart display
    const data = analytics.distribution.sort((a, b) => a.rating - b.rating);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Rating Distribution Breakdown</h3>
            <p className="text-4xl font-bold mb-4 text-center text-blue-500">{analytics.averageRating} / 5.0</p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Total {analytics.totalSubmissions} Submissions</p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                    {/* XAxis: Shows the rating number (1, 2, 3, 4, 5) */}
                    <XAxis dataKey="rating" stroke="#6b7280" interval={0} />

                    {/* YAxis: Shows the count of submissions */}
                    <YAxis allowDecimals={false} stroke="#6b7280" />

                    {/* Tooltip: Uses the custom component to render safe strings */}
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    />

                    {/* Bar: dataKey must point to the COUNT field */}
                    <Bar dataKey="count" fill="#3b82f6" name="Submission Count" radius={[10, 10, 0, 0]} />

                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main Page Component ---
const AnalyticsPage = () => {
    // Get the subjectId from the URL (e.g., /analytics/DSA)
    const params = useParams();
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    // Fetch analytics data using TanStack Query
    const { data: analytics, isPending, isError } = useQuery<AnalyticsData>({
        queryKey: ['subjectAnalytics', subjectId],
        queryFn: async () => {
            const res = await axios.get(`/api/analytics/${subjectId}`);
            return res.data;
        },
        enabled: !!subjectId,
    });

    if (isPending) return <div className="text-center py-20 text-xl">Loading Analytics...</div>;
    if (isError) return <div className="text-center py-20 text-red-500 text-xl">Error loading analytics. Check API route.</div>;

    if (!analytics || analytics.totalSubmissions === 0) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Analytics for {subjectId}</h1>
                <p className="text-gray-500">No feedback submitted for this subject yet.</p>
            </div>
        );
    }
    let subjectName;

    {subjectId === '1'? subjectName='DSA':
        subjectId==='2'? subjectName='DBMS':
            subjectId==='3'? subjectName='FSD':
                subjectId==='4'? subjectName='OOP':''
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Analytics for {subjectName}</h1>
                <RatingBarChart analytics={analytics} />

            </div>
        </div>
    );
};

export default AnalyticsPage;
