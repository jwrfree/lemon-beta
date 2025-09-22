
import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await userRef.set(
      {
        biometricCredentialId: admin.firestore.FieldValue.delete(),
        biometricCredentialPublicKey: admin.firestore.FieldValue.delete(),
        biometricCounter: admin.firestore.FieldValue.delete(),
        loginChallenge: admin.firestore.FieldValue.delete(),
        registrationChallenge: admin.firestore.FieldValue.delete(),
        isBiometricEnabled: false,
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unregistering biometric credential:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to unregister biometric credential.' },
      { status: 500 },
    );
  }
}
