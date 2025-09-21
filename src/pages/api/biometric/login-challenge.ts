
import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.biometricCredentialId) {
        return res.status(400).json({ message: 'Biometric login not enabled for this user.' });
    }

    // Generate a random challenge
    const challenge = randomBytes(32);

    // Store challenge temporarily, e.g., in the user's document
    await setDoc(userDoc.ref, { loginChallenge: challenge }, { merge: true });

    res.status(200).json({
      challenge: challenge,
      credentialIds: [userData.biometricCredentialId],
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
