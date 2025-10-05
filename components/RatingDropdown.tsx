"use client";
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RatingDropdownProps {
    subjectId: string;
    userId: string;
}

const RatingDropdown = ({ subjectId, userId }: RatingDropdownProps) => {
    const queryClient = useQueryClient();
    const ratings = [1, 2, 3, 4, 5];

    // --- Mutation Logic ---
    const mutation = useMutation({
        mutationFn: async (rating: number) => {
            const payload = {
                subjectId,
                userId,
                rating
            };
            // Call the new Next.js API route (Step 3)
            const res = await axios.post(`/api/feedback/submit-rating`, payload);
            return res.data;
        },
        onSuccess: () => {
            // Invalidate queries to refetch the SubjectCard data and update the average rating
            queryClient.invalidateQueries({ queryKey: ["subjectFeedback", subjectId] });
            queryClient.invalidateQueries({ queryKey: ["subjectAnalytics", subjectId] });
            console.log(`Rating submitted for ${subjectId}!`);
        },
        onError: (error) => {
            console.error("Error submitting rating:", error);
        },
    });

    const handleSelectRating = (rating: number) => {
        if (!userId) {
            alert("Please sign in to submit a rating.");
            return;
        }
        mutation.mutate(rating);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="btn-primary max-sm:w-full"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Saving..." : "Add Rating"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-700">
                {ratings.map((rating) => (
                    <DropdownMenuItem
                        key={rating}
                        className="cursor-pointer flex justify-between items-center"
                        onSelect={() => handleSelectRating(rating)}
                    >
                        <span>{rating} Star</span>
                        {rating === 5 && <span className="text-yellow-500">⭐</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default RatingDropdown;



//
// "use client"
//
// import * as React from "react"
//
// import { Button } from "@/components/ui/button"
// import {
//     DropdownMenu,
//     DropdownMenuContent, DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuRadioGroup,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
//
// export default function DropdownMenuRadioGroupDemo() {
//     const [position, setPosition] = React.useState("bottom")
//     const rating = ['1', '2', '3', '4', '5'];
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 {/*<Button variant="outline">Add Rating</Button>*/}
//                 <Button variant="outline" className="btn-primary max-sm:w-full">Add Rating</Button>
//
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56">
//                 <DropdownMenuLabel>Add Rating</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
//                     {rating.map((label,index) => (
//                         <DropdownMenuItem key={index}>{label}</DropdownMenuItem>
//                     ))}
//                 </DropdownMenuRadioGroup>
//             </DropdownMenuContent>
//         </DropdownMenu>
//
//     )
// }
