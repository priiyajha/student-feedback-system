import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { subjectId, userId, rating } = await request.json();

        if (!subjectId || !userId || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: 'Missing or invalid data: subjectId, userId, or rating required.' },
                { status: 400 }
            );
        }

        // Check if a rating already exists for this subject/user pair (optional: update instead of add)
        // For simplicity here, we add a new one, but you might want to check for an existing document
        // and update it instead of adding a duplicate rating document.

        // Write the new rating document to the 'feedback' collection
        await db.collection('feedback').add({
            subjectId: subjectId,
            userId: userId,
            rating: rating,
            createdAt: new Date(),
            totalScore: rating,
        });

        return NextResponse.json({ message: 'Rating submitted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Firestore submission error:', error);
        return NextResponse.json({ message: 'Failed to save rating to database.' }, { status: 500 });
    }
}
