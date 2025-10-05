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

interface Subject {
    id: string;
    subjectName: string;
    userId: string;
    finalized: boolean;
}

interface SignInParams {
    email: string;
    idToken: string;
}

interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
}
interface User {
    name: string;
    email: string;
    id: string;
}
