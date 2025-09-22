
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, credential } = await req.json();

    if (!userId || !credential) {
      return NextResponse.json({ message: 'Missing userId or credential' }, { status: 400 });
    }

    const userDocRef = doc(db, 'users', userId);
    
    await setDoc(userDocRef, {
        biometricCredentialId: credential.rawId,
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
