
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const usersSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data() ?? {};

    if (!userData.biometricCredentialId || !userData.biometricCredentialPublicKey) {
      return NextResponse.json(
        { message: 'Biometric login not enabled for this user.' },
        { status: 400 },
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: [
        {
          id: userData.biometricCredentialId,
          transports: ['internal'],
        },
      ],
    });

    await userDoc.ref.set(
      {
        loginChallenge: options.challenge,
      },
      { merge: true },
    );

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Error generating login challenge:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to prepare biometric login.' },
      { status: 500 },
    );
  }
}
