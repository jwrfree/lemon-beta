
import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.biometricCredentialId) {
        return NextResponse.json({ message: 'Biometric login not enabled for this user.' }, { status: 400 });
    }

    // Generate a random challenge
    const challenge = randomBytes(32);

    // Store challenge temporarily, e.g., in the user's document
    await setDoc(userDoc.ref, { loginChallenge: Buffer.from(challenge).toJSON() }, { merge: true });

    return NextResponse.json({
      challenge: Buffer.from(challenge).toJSON().data,
      credentialIds: [userData.biometricCredentialId],
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
