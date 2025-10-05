import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { subjectId, userId, comment } = await request.json();

        if (!subjectId || !userId || !comment) {
            return NextResponse.json(
                { message: 'Missing subject ID, user ID, or comment.' },
                { status: 400 }
            );
        }

        // --- Save Data to Firestore ---
        await db.collection('feedback').add({
            subjectId: subjectId,
            userId: userId,
            comment: comment,
            createdAt: new Date(),
        });

        return NextResponse.json({ message: 'Review submitted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Firestore review submission error:', error);
        return NextResponse.json({ message: 'Failed to save review.' }, { status: 500 });
    }
}
