import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { generateRegistrationOptions } from '@simplewebauthn/server';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'Lemon App';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { message: 'Missing userId or email' },
        { status: 400 },
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data() ?? {};

    const options = await generateRegistrationOptions({
      rpID: RP_ID,
      rpName: RP_NAME,
      userID: Buffer.from(userId),
      userName: email,
      userDisplayName: email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: userData.biometricCredentialId
        ? [
            {
              id: userData.biometricCredentialId,
              transports: ['internal'],
            },
          ]
        : [],
    });

    await userRef.set(
      {
        registrationChallenge: options.challenge,
      },
      { merge: true },
    );

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Error generating registration options:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to prepare biometric registration.' },
      { status: 500 },
    );
  }
}
