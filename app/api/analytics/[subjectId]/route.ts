import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

// Note: params is correctly received here, but needs to be handled carefully inside the function.
export async function GET(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {

    const { subjectId } = params;

    if (!subjectId) {
        return NextResponse.json({ message: 'Subject ID is required.' }, { status: 400 });
    }

    try {
        // --- 1. Calculate Average Rating ---
        // Get all feedback documents for this subject
        const feedbackDocs = await db.collection('feedback')
            .where('subjectId', '==', subjectId)
            .get();

        if (feedbackDocs.empty) {
            return NextResponse.json({
                averageRating: 0,
                totalSubmissions: 0,
                distribution: []
            }, { status: 200 });
        }

        let totalScore = 0;
        let ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        feedbackDocs.docs.forEach(doc => {
            const data = doc.data();
            const rating = data.rating;
            if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
                totalScore += rating;
                ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
            }
        });

        const totalSubmissions = feedbackDocs.size;
        const averageRating = totalSubmissions > 0 ? (totalScore / totalSubmissions) : 0;

        // --- 2. Format Distribution Data for Charts ---
        const chartData = Object.keys(ratingCounts).map(ratingKey => ({
            rating: parseInt(ratingKey),
            count: ratingCounts[parseInt(ratingKey)],
        }));

        const analytics = {
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalSubmissions: totalSubmissions,
            distribution: chartData,
        };

        return NextResponse.json(analytics, { status: 200 });
    } catch (error) {
        console.error('API Error fetching analytics:', error);
        // Returning a 500 status with an error message
        return NextResponse.json({ message: 'Failed to fetch analytics data.' }, { status: 500 });
    }
}
