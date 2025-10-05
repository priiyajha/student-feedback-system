import { db } from '@/firebase/admin';


export interface Subject {
    id: string;
    name: string;
    code?: string; // Assuming 'code' is optional
}

export interface UserFeedback {
    id: string;
    subjectId: string;
    userId: string;
    rating: number | null; // The star rating (1-5)
    comment: string | null; // The text review
    createdAt: Date; // Assuming it's a Date type after hydration
}

export interface AnalyticsData {
    averageRating: number;
    totalSubmissions: number;
    distribution: { rating: number; count: number }[];
}

// --- DATA FETCHING FUNCTIONS ---

/**
 * Fetches all subjects/courses from the Firestore database.
 * This function runs securely on the server.
 */
export async function getSubjects(): Promise<Subject[]> {
    try {
        const subjectsRef = db.collection("subjects"); // Fetch from 'subjects' collection
        const snapshot = await subjectsRef.get();

        if (snapshot.empty) {
            console.log("No subjects found in Firestore.");
            return [];
        }

        const subjects: Subject[] = snapshot.docs.map(doc => ({
            id: doc.id,
            // Firestore data is merged with the ID
            ...doc.data(),
        } as Subject));

        return subjects;

    } catch (error) {
        console.error("Error fetching subjects from database:", error);
        return [];
    }
}


/**
 * Fetches the specific feedback (rating/review) submitted by a single user
 * for a single subject. This runs on the server.
 */
export async function getUserFeedbackBySubjectId(
    subjectId: string,
    userId: string
): Promise<UserFeedback | null> {
    try {
        const feedbackRef = db.collection("feedback");

        // Query: Find one document matching both subjectId AND userId
        const querySnapshot = await feedbackRef
            .where("subjectId", "==", subjectId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return null; // User has not submitted feedback yet
        }

        const feedbackDoc = querySnapshot.docs[0];

        // Return the merged ID and data
        return {
            id: feedbackDoc.id,
            ...(feedbackDoc.data() as Omit<UserFeedback, 'id'>)
        } as UserFeedback;

    } catch (error) {
        console.error("Error fetching user feedback:", error);
        return null;
    }
}


/**
 * Calculates the average rating and distribution data for a specific subject
 * by fetching all relevant feedback documents.
 */
export async function getSubjectAnalytics(subjectId: string): Promise<AnalyticsData> {
    if (!subjectId) {
        throw new Error("Subject ID is required for analytics.");
    }

    try {
        // Fetch all feedback documents for the given subject ID
        const feedbackDocs = await db.collection('feedback')
            .where('subjectId', '==', subjectId)
            .get();

        if (feedbackDocs.empty) {
            return { averageRating: 0, totalSubmissions: 0, distribution: [] };
        }

        let totalScore = 0;
        // Initialize rating counts for all 5 stars
        const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

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

        // Format Distribution Data for Charts
        const distribution = Object.keys(ratingCounts).map(ratingKey => ({
            rating: parseInt(ratingKey),
            count: ratingCounts[parseInt(ratingKey)],
        }));

        return {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalSubmissions: totalSubmissions,
            distribution: distribution,
        };
    } catch (error) {
        console.error(`Error calculating analytics for ${subjectId}:`, error);
        // Return zeros on failure
        return { averageRating: 0, totalSubmissions: 0, distribution: [] };
    }
}
