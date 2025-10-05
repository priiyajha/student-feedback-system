// components/QueryProvider.tsx
"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client instance outside the component
const queryClient = new QueryClient();

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
