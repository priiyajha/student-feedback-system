import React from 'react'
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import RatingDropdown from './RatingDropdown';


import { getUserFeedbackBySubjectId, getSubjectAnalytics, UserFeedback, AnalyticsData } from '@/lib/data';
import 'server-only';


interface SubjectCardProps {
    subjectId?: string;
    subjectName?: string;
    userId?: string;
    finalized?: boolean;
}

// NOTE: AnalyticsData interface is now imported from '@/lib/data'

const SubjectCard = async ({subjectId, subjectName, userId}: SubjectCardProps) => {

    // Ensure subjectId and userId are present before proceeding with server calls
    const isUserLoggedInAndSubjectValid = subjectId && userId;

    let userFeedback: UserFeedback | null = null;
    let subjectAnalytics: AnalyticsData | null = null;
    let averageRatingDisplay = "---";

    // --- 1. Fetch User's Specific Feedback (For form pre-population) ---
    if (isUserLoggedInAndSubjectValid) {
        userFeedback = await getUserFeedbackBySubjectId(subjectId!, userId!);
    }

    // --- 2. Fetch Aggregated Subject Analytics (For public display) ---
    if (subjectId) {
        try {
            // DIRECTLY call the secure server function to get the calculated average
            subjectAnalytics = await getSubjectAnalytics(subjectId);

            // Set the display rating from the aggregated data
            averageRatingDisplay = subjectAnalytics.averageRating > 0
                ? subjectAnalytics.averageRating.toFixed(1)
                : '---';

        } catch (e) {
            // Log any errors during the direct database read
            console.error(`Failed to fetch analytics for ${subjectId} directly from server:`, e);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 h-full
        flex flex-row justify-center items-center">
            <div className="card-interview ">
                <div className="grid grid-cols-1 gap-6">

                    <h3 className="mt-5 items-center capitalize">{subjectName}</h3>

                    {/* Display the calculated AVERAGE Rating */}
                    <div className="flex flex-col gap-5 mt-3 justify-center items-center">
                        <div className="flex  gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22} />

                            {/* Display the AVERAGE RATING */}
                            <p className="text-xl font-bold">{averageRatingDisplay}/5</p>

                            {subjectAnalytics && (
                                <span className="text-sm text-gray-500">({subjectAnalytics.totalSubmissions} votes)</span>
                            )}
                        </div>

                        <div className="flex  gap-2">
                            {/* Link to the dedicated analytics page for charts */}
                            <Button asChild className="btn-primary max-sm:w-full">
                                <Link href={`/analytics/${subjectId}`}>View Analytics</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Display the user's previously submitted text review */}
                    <p className="line-clamp-2 mt-5 text-center text-gray-500 dark:text-gray-400">
                        {userFeedback?.comment || "No personal review submitted yet."}
                    </p>

                    <div className="flex flex-row justify-between gap-5 mt-20 ">
                        {/* 1. Review Form */}
                        {isUserLoggedInAndSubjectValid ? (
                            <ReviewForm
                                subjectId={subjectId!}
                                userId={userId!}
                                // initialReview={userFeedback?.comment || ''} Pass initial review text for editing
                            />
                        ) : (
                            <Button className="btn-primary max-sm:w-full" disabled>
                                Add Review (Sign In)
                            </Button>
                        )}

                        {/* 2. Rating Dropdown */}
                        {isUserLoggedInAndSubjectValid ? (
                            <RatingDropdown
                                subjectId={subjectId!}
                                userId={userId!}
                            />
                        ) : (
                            <Button className="btn-primary max-sm:w-full" disabled>
                                Add Rating (Sign In)
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SubjectCard;
