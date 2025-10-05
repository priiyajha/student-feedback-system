
import React from 'react'
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/firebase/admin";
import RatingDropdown from "@/components/RatingDropdown";

interface SubjectCardProps {
    subjectId?: string;
    subjectName?: string;
    userId?: string;
    finalized?: boolean;
}

interface Feedback {
    id: string;
    subjectId: string;
    totalScore: number;
}

interface GetFeedbackBySubjectIdParams {
    subjectId: string;
    userId: string;
}

export async function getFeedbackBySubjectId(
    params: GetFeedbackBySubjectIdParams
): Promise<Feedback | null> {
    const { subjectId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("subjectId", "==", subjectId)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;

}

const SubjectCard = async ({subjectId, subjectName, userId, finalized}: SubjectCardProps) => {

    const feedback =
        userId && subjectId
            ? await getFeedbackBySubjectId({
                subjectId,
                userId,
            })
            : null;



    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 h-full
        flex flex-row justify-center items-center">
            <div className="card-interview ">
                <div className="grid grid-cols-1 gap-6">

                    {/* Cover Image */}
                    {/*<Image*/}
                    {/*    src={getRandomInterviewCover()}*/}
                    {/*    alt="cover-image"*/}
                    {/*    width={90}*/}
                    {/*    height={90}*/}
                    {/*    className="rounded-full object-fit size-[90px]"*/}
                    {/*/>*/}

                    {/* Interview Role */}
                    <h3 className="mt-5 capitalize">{subjectName}</h3>

                    {/* Date & Score */}
                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2">

                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            {/*<Image src="star.svg" width={22} height={22} alt="star" />*/}
                            <Image src="/star.svg" alt="star" width={22} height={22} />
                            <p>{feedback?.totalScore || "---"}/5</p>
                        </div>
                    </div>

                    {/* Feedback or Placeholder Text */}
                    {/*<p className="line-clamp-2 mt-5">*/}
                    {/*    {feedback?.finalAssessment ||*/}
                    {/*        "You haven't taken this interview yet. Take it now to improve your skills."}*/}
                    {/*</p>*/}

                    <div className="flex flex-row justify-between gap-5 mt-20 ">
                        <Button asChild className="btn-primary max-sm:w-full">
                            <Link href="/">Add Review</Link>
                        </Button>
                        <RatingDropdown/>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SubjectCard;
