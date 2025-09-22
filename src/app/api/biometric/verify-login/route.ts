
import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

function base64UrlToBuffer(base64urlString: string): Buffer {
  const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
  return Buffer.from(padded, 'base64');
}

export async function POST(req: NextRequest) {
  try {
    const { email, assertion } = await req.json();

    if (!email || !assertion) {
      return NextResponse.json(
        { message: 'Missing email or assertion.' },
        { status: 400 },
      );
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
    const userId = userDoc.id;

    if (
      !userData.biometricCredentialId ||
      !userData.biometricCredentialPublicKey ||
      !userData.loginChallenge
    ) {
      return NextResponse.json(
        { message: 'Biometric login not set up or no challenge found.' },
        { status: 400 },
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: assertion as AuthenticationResponseJSON,
      expectedChallenge: userData.loginChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: userData.biometricCredentialId,
        credentialPublicKey: base64UrlToBuffer(
          userData.biometricCredentialPublicKey,
        ),
        counter: userData.biometricCounter || 0,
        transports: ['internal'],
      },
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json(
        { message: 'Biometric authentication failed.' },
        { status: 401 },
      );
    }

    const { newCounter } = verification.authenticationInfo;

    await userDoc.ref.set(
      {
        loginChallenge: admin.firestore.FieldValue.delete(),
        biometricCounter: newCounter,
        isBiometricEnabled: true,
      },
      { merge: true },
    );

    const customToken = await admin.auth().createCustomToken(userId);

    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error('Biometric verification error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to verify biometric login.' },
      { status: 500 },
    );
  }
}
