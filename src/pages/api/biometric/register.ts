
import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId, credential } = req.body;

    if (!userId || !credential) {
      return res.status(400).json({ message: 'Missing userId or credential' });
    }

    const userDocRef = doc(db, 'users', userId);
    
    // Store the credential ID. We use the rawId as it's the URL-safe base64 string.
    await updateDoc(userDocRef, {
        biometricCredentialId: credential.rawId,
        // You might want to store the full credential object for recovery,
        // but for basic auth, the ID is what's needed for `allowCredentials`.
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
