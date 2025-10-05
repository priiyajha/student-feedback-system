"use client";
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReviewFormProps {
    subjectId: string;
    userId: string;
}

const ReviewForm = ({ subjectId, userId }: ReviewFormProps) => {
    const [review, setReview] = useState('');
    const queryClient = useQueryClient();

    // --- Mutation Logic ---
    const mutation = useMutation({
        mutationFn: async (comment: string) => {
            const payload = {
                subjectId,
                userId,
                comment, // The review text
                // Optional: You could allow users to submit a rating here too,
                // but we'll focus on just the comment for now.
            };
            // Call the new API route
            const res = await axios.post(`/api/feedback/submit-review`, payload);
            return res.data;
        },
        onSuccess: () => {
            setReview(''); // Clear the input field

            // Invalidate queries to refetch the list of reviews/analytics
            queryClient.invalidateQueries({ queryKey: ["subjectReviews", subjectId] });
            queryClient.invalidateQueries({ queryKey: ["subjectAnalytics", subjectId] });

            toast.success("Review submitted successfully!");
        },
        onError: (error) => {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Network error occurred.'
                : 'An unknown error occurred.';
            toast.error(`Failed to submit review: ${errorMessage}`);
            console.error("Review submission error:", error);
        },
    });

    const handleSubmit = () => {
        if (!userId) {
            toast.error("You must be logged in to submit a review.");
            return;
        }
        if (review.trim().length < 5) {
            toast.error("Review must be at least 5 characters long.");
            return;
        }
        mutation.mutate(review);
    };

    return (
        <div className="flex flex-col gap-2 mt-5 w-full">
            <textarea
                placeholder="Type your review here..."
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                disabled={mutation.isPending}
            />
            <Button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={mutation.isPending || review.trim().length < 5}
            >
                {mutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
        </div>
    );
};

export default ReviewForm;
