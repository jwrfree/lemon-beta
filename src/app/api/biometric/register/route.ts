
import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

function bufferToBase64Url(buffer: Uint8Array | ArrayBuffer): string {
  const byteArray = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Buffer.from(byteArray)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, credential } = await req.json();

    if (!userId || !credential) {
      return NextResponse.json(
        { message: 'Missing userId or credential' },
        { status: 400 },
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data() ?? {};

    if (!userData.registrationChallenge) {
      return NextResponse.json(
        { message: 'No registration challenge found for user.' },
        { status: 400 },
      );
    }

    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: userData.registrationChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { message: 'Failed to verify biometric registration.' },
        { status: 400 },
      );
    }

    const { credentialID, credentialPublicKey, counter } =
      verification.registrationInfo;

    await userRef.set(
      {
        biometricCredentialId: credentialID,
        biometricCredentialPublicKey: bufferToBase64Url(credentialPublicKey),
        biometricCounter: counter,
        isBiometricEnabled: true,
        registrationChallenge: admin.firestore.FieldValue.delete(),
        email: email ?? userData.email,
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error verifying biometric registration:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to register biometric credential.' },
      { status: 500 },
    );
  }
}
