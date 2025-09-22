
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, FieldValue } from 'firebase/firestore';
import { db, admin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const userDocRef = doc(db, 'users', userId);
    
    await setDoc(userDocRef, {
      biometricCredentialId: admin.firestore.FieldValue.delete(),
      isBiometricEnabled: false
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
