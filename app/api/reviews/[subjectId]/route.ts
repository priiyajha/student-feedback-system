import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {
    // FINAL FIX: Explicitly consume the request object to satisfy the Next.js static analyzer.
    await request.text();
    const { subjectId } = params;

    if (!subjectId) {
        return NextResponse.json({ message: 'Subject ID is required.' }, { status: 400 });
    }

    try {

        const reviewsSnapshot = await db.collection('feedback')
            .where('subjectId', '==', subjectId)
            .where('comment', '!=', '') // Filter out documents where comment is empty string
            .orderBy('comment')           // Firestore requires ordering by the field used in != filter
            .orderBy('createdAt', 'desc')
            .get();

        if (reviewsSnapshot.empty) {
            return NextResponse.json([]);
        }

        const reviews = reviewsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                rating: data.rating,
                comment: data.comment,
                userId: data.userId,
                // Ensure the date is correctly converted and formatted for the client
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
            };
        });

        return NextResponse.json(reviews, { status: 200 });

    } catch (error) {
        // This logs the index requirement error until the index is built
        console.error('API Error fetching reviews:', error);
        return NextResponse.json({ message: 'Failed to fetch reviews data. Check Firebase Index.' }, { status: 500 });
    }
}
