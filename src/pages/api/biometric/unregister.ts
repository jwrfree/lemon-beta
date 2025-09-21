
import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, FieldValue } from 'firebase/firestore';
import { db, admin } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    const userDocRef = doc(db, 'users', userId);
    
    // Remove the biometric credential field from the user's document
    await setDoc(userDocRef, {
      biometricCredentialId: admin.firestore.FieldValue.delete(),
      isBiometricEnabled: false
    }, { merge: true });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
