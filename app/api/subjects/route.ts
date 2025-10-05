import { db } from '@/firebase/admin';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const { name, code } = await request.json();
    if (!name || !code) {
        return NextResponse.json({ message: 'Name and Code are required.' }, { status: 400 });
    }
    try {
        const docRef = await db.collection('subjects').add({ name, code });
        return NextResponse.json({ id: docRef.id, name, code }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to create subject.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const { id, name, code } = await request.json();
    if (!id || !name || !code) {
        return NextResponse.json({ message: 'ID, Name, and Code are required.' }, { status: 400 });
    }
    try {
        await db.collection('subjects').doc(id).update({ name, code });
        return NextResponse.json({ message: 'Subject updated.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update subject.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: 'Subject ID is required.' }, { status: 400 });
    }
    try {
        await db.collection('subjects').doc(id).delete();
        return NextResponse.json({ message: 'Subject deleted.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete subject.' }, { status: 500 });
    }
}

// Reuse the existing GET logic from lib/data.ts but wrapped as a route handler
export async function GET() {
    try {
        const snapshot = await db.collection("subjects").get();
        const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(subjects, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch subjects.' }, { status: 500 });
    }
}