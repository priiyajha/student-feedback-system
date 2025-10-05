"use client";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios'; // Import AxiosError for better error handling
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'; // Consolidated Dialog imports
import { Loader2, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Subject } from '@/lib/data'; // Assuming Subject type is exported from lib/data

// --- 1. Subject Fetching and CRUD Mutations (Client Component Hooks) ---

// Define the API URL prefix for our CRUD routes
const SUBJECTS_API_URL = '/api/subjects';

// 1. Fetch subjects hook
const useSubjects = () => {
    return useQuery<Subject[]>({
        queryKey: ['subjects'],
        queryFn: async () => {
            const { data } = await axios.get(SUBJECTS_API_URL);
            return data;
        },
    });
};

// --- 2. Subject Modal Component for Add/Edit ---

interface SubjectModalProps {
    subject?: Subject; // If provided, we are editing; if not, we are adding
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const SubjectModal = ({ subject, isOpen, setIsOpen }: SubjectModalProps) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState(subject?.name || '');
    const [code, setCode] = useState(subject?.code || '');

    const isEditing = !!subject;
    const actionText = isEditing ? 'Save Changes' : 'Create Subject';

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = { name, code };

            if (isEditing) {
                await axios.put(SUBJECTS_API_URL, { ...payload, id: subject!.id }); // Added ! non-null assertion
            } else {
                await axios.post(SUBJECTS_API_URL, payload);
            }
        },
        onSuccess: () => {
            toast.success(`${subject?.name || name} successfully ${isEditing ? 'updated' : 'created'}.`);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            setIsOpen(false);
        },
        onError: (e: unknown) => { // Changed 'any' to 'unknown'
            let message = 'Failed to save subject.';
            if (axios.isAxiosError(e)) {
                const axiosError = e as AxiosError<{ message: string }>;
                message = axiosError.response?.data?.message || message;
            }
            toast.error(message);
        }
    });

    const handleDelete = useMutation({
        mutationFn: async () => {
            await axios.delete(SUBJECTS_API_URL, { data: { id: subject!.id } });
        },
        onSuccess: () => {
            toast.success(`${subject!.name} deleted.`);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            setIsOpen(false);
        },
        onError: (e: unknown) => { // Changed 'any' to 'unknown'
            let message = 'Failed to delete subject.';
            if (axios.isAxiosError(e)) {
                const axiosError = e as AxiosError<{ message: string }>;
                message = axiosError.response?.data?.message || message;
            }
            toast.error(message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !code) {
            toast.warning("Both Name and Code are required.");
            return;
        }
        mutation.mutate();
    };

    const isPending = mutation.isPending || handleDelete.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-300">
                <DialogHeader>
                    <DialogTitle className="text-white">{isEditing ? `Edit ${subject!.name}` : 'Add New Subject'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="card-cta grid gap-4 py-4">
                    <div>
                        <label className="text-sm font-medium text-gray-400">Subject Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 bg-gray-700 text-white border-gray-600"
                            disabled={isPending}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">Subject Code</label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="mt-1 bg-gray-700 text-white border-gray-600"
                            disabled={isPending}
                        />
                    </div>
                    <DialogFooter className="mt-4 gap-2">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => handleDelete.mutate()}
                                disabled={isPending}
                                className="btn-primary items-center"

                            >
                                {handleDelete.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        )}
                        <Button type="submit" disabled={isPending || !name || !code} className="btn-primary items-center hover:bg-blue-700 text-white">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : actionText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// --- 3. Main Admin Page Component ---

const AdminPage = () => {
    // NOTE: This should be replaced with a secure server-side admin check (not implemented here)
    const isAdmin = true; // Placeholder: Assume user is admin for UI testing

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);

    const { data: subjects, isPending, isError } = useSubjects();

    if (!isAdmin) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Access Denied: Admin privileges required.</div>;
    }

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedSubject(undefined);
        setIsModalOpen(true);
    };

    return (
        <section className="card-cta flex flex-col justify-center items-center mt-30 mx-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="flex flex-col justify-center items-center mb-8 pb-4 border-b border-gray-700">
                    <h1 className="text-3xl font-bold">Subject Management Panel</h1>
                    <Button
                        onClick={handleCreate}
                        className="btn-primary mt-10 w-full text-white flex items-center gap-2"
                    >
                        <PlusCircle className="h-5 w-5" /> Add New Subject
                    </Button>
                </header>

                <SubjectModal
                    subject={selectedSubject}
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                />

                <Card className="bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Available Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isPending ? (
                            <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" /> <p>Loading subjects...</p></div>
                        ) : isError ? (
                            <p className="text-red-500">Error loading subjects. Check API connection.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {(subjects || []).map((subject) => (
                                    <div
                                        key={subject.id}
                                        className="flex justify-between items-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition"
                                    >
                                        <div>
                                            <p className="font-semibold text-lg">{subject.name}</p>
                                            <p className="text-sm text-gray-400">{subject.code}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleEdit(subject)}
                                            className="btn-primary mt-10  text-white flex items-center gap-2"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

export default AdminPage;
