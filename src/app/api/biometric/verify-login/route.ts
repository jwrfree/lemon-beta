
import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, deleteField } from 'firebase/firestore';
import { db, admin } from '@/lib/firebase-admin';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

function base64UrlToBuffer(base64urlString: string): ArrayBuffer {
    const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


export async function POST(req: NextRequest) {
  try {
    const { email, assertion } = await req.json();

    if (!email || !assertion) {
      return NextResponse.json({ message: 'Missing email or assertion.' }, { status: 400 });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    if (!userData.biometricCredentialId || !userData.loginChallenge) {
      return NextResponse.json({ message: 'Biometric login not set up or no challenge found.' }, { status: 400 });
    }

    const expectedChallenge = Buffer.from(userData.loginChallenge.data).toString('base64url');

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: assertion,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: base64UrlToBuffer(userData.biometricCredentialId),
                credentialPublicKey: Buffer.from(""), // Not needed for verification
                counter: 0, 
                transports: ['internal'],
            },
            requireUserVerification: true,
        });

    } catch(e: any) {
        console.error("WebAuthn verification failed:", e);
        return NextResponse.json({ message: `Verification failed: ${e.message}` }, { status: 401 });
    }

    const { verified } = verification;

    if (verified) {
      // Clear the challenge
      await updateDoc(userDoc.ref, { loginChallenge: deleteField() });

      // Generate a custom token for Firebase client-side auth
      const customToken = await admin.auth().createCustomToken(userId);

      return NextResponse.json({ success: true, customToken });
    }

    return NextResponse.json({ message: 'Biometric authentication failed.' }, { status: 401 });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
