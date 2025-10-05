import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {
    // FINAL FIX for Next.js warning: Explicitly consume the request object to satisfy the static analyzer.
    await request.text();

    // Using the destructured parameter, which is now resolved.
    const { subjectId } = params;

    if (!subjectId) {
        return NextResponse.json({ message: 'Subject ID is required.' }, { status: 400 });
    }

    try {
        // --- 1. Fetch Subject Name ---
        const subjectDoc = await db.collection('subjects').doc(subjectId).get();
        // Use the fetched name, fallback to the ID if the document doesn't exist
        const subjectName = subjectDoc.exists ? (subjectDoc.data()?.name || subjectId) : subjectId;

        // --- 2. Calculate Aggregate Data ---
        const feedbackDocs = await db.collection('feedback')
            .where('subjectId', '==', subjectId)
            .get();

        if (feedbackDocs.empty) {
            return NextResponse.json({
                subjectName: subjectName,
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

        // --- 3. Format Response ---
        const chartData = Object.keys(ratingCounts).map(ratingKey => ({
            rating: parseInt(ratingKey),
            count: ratingCounts[parseInt(ratingKey)],
        }));

        const analytics = {
            subjectName: subjectName,
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalSubmissions: totalSubmissions,
            distribution: chartData,
        };

        return NextResponse.json(analytics, { status: 200 });
    } catch (error) {
        console.error('API Error fetching analytics:', error);
        return NextResponse.json({ message: 'Failed to fetch analytics data.' }, { status: 500 });
    }
}
