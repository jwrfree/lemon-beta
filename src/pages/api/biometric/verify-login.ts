
import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, admin } from '@/lib/firebase-admin';
import { verifyRegistrationResponse, verifyAuthenticationResponse } from '@simplewebauthn/server';

function base64UrlDecode(base64UrlString: string): Buffer {
  const base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + '='.repeat(padLength);
  return Buffer.from(paddedBase64, 'base64');
}

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, assertion } = req.body;

    if (!email || !assertion) {
      return res.status(400).json({ message: 'Missing email or assertion.' });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    if (!userData.biometricCredentialId || !userData.loginChallenge) {
      return res.status(400).json({ message: 'Biometric login not set up or no challenge found.' });
    }

    // `get` returns a plain object, so we must convert the challenge buffer
    const expectedChallenge = Buffer.from(userData.loginChallenge.data).toString('base64url');

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: assertion,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: base64UrlDecode(userData.biometricCredentialId),
                credentialPublicKey: Buffer.from(""), // Not needed for verification, but required by type
                counter: 0, // We are not checking counter
                transports: ['internal'],
            },
            requireUserVerification: true,
        });

    } catch(e: any) {
        console.error("WebAuthn verification failed:", e);
        return res.status(401).json({ message: `Verification failed: ${e.message}` });
    }

    const { verified } = verification;

    if (verified) {
      // Clear the challenge
      await updateDoc(userDoc.ref, { loginChallenge: null });

      // Generate a custom token for Firebase client-side auth
      const customToken = await admin.auth().createCustomToken(userId);

      return res.status(200).json({ success: true, customToken });
    }

    res.status(401).json({ message: 'Biometric authentication failed.' });

  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ message: error.message });
  }
}
