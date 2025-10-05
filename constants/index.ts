interface Subject {
    id: string;
    subjectName: string;
    userId: string;
    finalized: boolean;
}


export const dummySubjects: Subject[] = [
    {
        id: "1",
        userId: "user1",
        subjectName:"DSA",
        finalized: false,

    },
    {
        id: "2",
        userId: "user1",
        subjectName:"DBMS",
        finalized: false,

    },
    {
        id: "3",
        userId: "user1",
        subjectName:"OOP",
        finalized: false,

    },
    {
        id: "4",
        userId: "user1",
        subjectName:"FSD",
        finalized: false,
    },
];