import React from 'react';
import SubjectCard from "@/components/SubjectCard";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getSubjects } from '@/lib/data'; // Import your server data fetching function
import { dummySubjects } from "@/constants";
import Link from "next/link";
import {Button} from "@/components/ui/button"; // Keep for now, but we will use getSubjects()

// 1. CONVERTED TO ASYNC SERVER COMPONENT
const Page = async () => {

    // 2. FETCH AUTHENTICATION AND DATA ON THE SERVER
    const user = await getCurrentUser();
    const currentUserId = user?.id; // Will be the UID or undefined/null

    // 3. FETCH SUBJECTS
    // NOTE: If getSubjects() is not implemented yet, use dummySubjects.
    const subjects = getSubjects ? await getSubjects() : dummySubjects;

    return (
        <>
            <section className="card-cta flex flex-col justify-center items-center">
                <div className=" gap-3 max-w mb-20" >
                    <h2>Check and Submit Ratings and Reviews</h2>
                    <p className="text-xl text-center my-10">
                        See real time feedbacks & get instant insights
                    </p>
                </div>
                <section className="flex flex-col gap-6 mt-8">
                    <h2>Your Subjects</h2>
                    <div className="interviews-section">
                        {/* 4. MAP OVER FETCHED SUBJECTS AND PASS USER ID */}
                        {subjects?.map((subject) => (
                            <SubjectCard
                                key={subject.id}
                                subjectId={subject.id} // Ensure you pass individual props, not spread
                                subjectName={subject.name ||subject.subjectName}
                                userId={currentUserId} // <-- THIS IS THE CRITICAL LINE
                            />

                        ))}
                    </div>
                </section>
                <Button asChild className="btn-primary w-full mt-20">
                    <Link href="/admin">Admin Panel</Link>
                </Button>
            </section>
        </>
    )
}
export default Page