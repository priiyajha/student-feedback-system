import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebase/admin'; // Import your Firebase Admin SDK instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Check HTTP Method
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. Extract Data from Request Body
    const { subjectId, userId, comment } = req.body;

    // 3. Basic Validation
    if (!subjectId || !userId || !comment || comment.trim().length < 5) {
        return res.status(400).json({
            message: 'Invalid request: subject ID, user ID, and a comment of at least 5 characters are required.'
        });
    }

    // 4. Secure Database Write (Using Firebase Admin SDK)
    try {
        // You can choose to store reviews in the 'feedback' collection or a separate 'reviews' collection.
        // For simplicity, we'll use 'feedback' and ensure the required fields are set.

        // Save the new review document
        const newDoc = await db.collection('feedback').add({
            subjectId: subjectId,
            userId: userId,
            comment: comment,

            // Since this is just a review, we set rating/score to null or 0.
            // If you want to require a rating with every review, you would add 'rating' validation above.
            rating: null,
            totalScore: null,

            createdAt: new Date(),
        });

        // 5. Success Response
        return res.status(200).json({
            message: 'Review submitted successfully',
            id: newDoc.id
        });

    } catch (error) {
        console.error('Firestore review submission error:', error);
        // 6. Error Response
        return res.status(500).json({ message: 'Failed to save review to database.' });
    }
}
