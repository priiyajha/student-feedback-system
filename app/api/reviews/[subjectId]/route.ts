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
        // --- 1. Fetch Reviews ---
        let query = db.collection('feedback')
            .where('subjectId', '==', subjectId)
            // Filter only documents with a non-empty text review
            .where('comment', '!=', '')
            .orderBy('comment') // Required for the != filter
            .orderBy('createdAt', 'desc');

        // NOTE: If you get a FAILED_PRECONDITION error, you must create the index in Firebase.
        const reviewsSnapshot = await query.get();

        if (reviewsSnapshot.empty) {
            return NextResponse.json([]);
        }

        const reviews = reviewsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt ? data.createdAt.toMillis() : null,
            };
        });

        // --- 2. Fetch User Names ---
        const userIds = Array.from(new Set(reviews.map(r => r.userId)));
        const userRefs = userIds.map(id => db.collection('users').doc(id));

        // Fetch all user documents in a single batch
        const userSnapshots = userRefs.length > 0 ? await db.getAll(...userRefs) : [];
        const userMap = new Map();

        userSnapshots.forEach(doc => {
            if (doc.exists) {
                // Store the name; fall back to a shortened ID if name isn't set in the 'users' collection
                userMap.set(doc.id, doc.data()?.name || `User ${doc.id.substring(0, 5)}`);
            }
        });

        // --- 3. Attach Name to Reviews ---
        const reviewsWithNames = reviews.map(review => ({
            ...review,
            // Attach the full name to the review object
            userName: userMap.get(review.userId) || `User ${review.userId.substring(0, 5)}...`,
        }));

        return NextResponse.json(reviewsWithNames, { status: 200 });

    } catch (error: any) {
        console.error('API Error fetching reviews:', error);

        // Handle missing index error (code 9)
        if (error.code === 9) {
            return NextResponse.json(
                { message: 'Failed due to missing Firestore index.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Failed to fetch reviews data.' },
            { status: 500 }
        );
    }
}
