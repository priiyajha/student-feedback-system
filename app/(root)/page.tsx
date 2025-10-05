import React from 'react'
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const Page = () => {
    return (
        <>
            <section className="card-cta flex flex-col justify-center items-center">
                <div className=" gap-3 max-w mb-20" >
                    <h2>Check and Submit Ratings and Reviews</h2>
                    <p className="text-xl text-center my-10">
                        See real feedbacks & get instant insights
                    </p>

                </div>
                <Button asChild className="btn-primary max-sm:w-full">
                    <Link href="/">Submit your review</Link>
                </Button>



            </section>
        </>
    )
}
export default Page
