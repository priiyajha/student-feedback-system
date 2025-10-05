import React from 'react'


import {dummySubjects} from "@/constants";
import SubjectCard from "@/components/SubjectCard";

const Page = () => {
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
                        {
                            dummySubjects?.map((subject) => (
                                <SubjectCard  key={subject.id} {...subject} />
                            ))}

                        {/*<p>You haven&apos;t submitted any ratings or reviews yet</p>*/}

                    </div>

                </section>
            </section>
        </>
    )
}
export default Page
