
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isWebAuthnSupported,
  createCredential,
  getCredential,
} from '@/lib/webauthn';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

export const useBiometric = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isWebAuthnSupported();
      setIsBiometricSupported(supported);
    };
    checkSupport();
  }, []);

  const registerBiometric = useCallback(
    async (userEmail: string, userId: string) => {
      try {
        const optionsRes = await fetch('/api/biometric/register/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: userEmail,
          }),
        });

        if (!optionsRes.ok) {
          const error = await optionsRes.json().catch(() => ({}));
          throw new Error(
            error.message || 'Failed to prepare biometric registration.',
          );
        }

        const options: PublicKeyCredentialCreationOptionsJSON =
          await optionsRes.json();

        const credential = await createCredential(options);

        const response = await fetch('/api/biometric/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: userEmail,
            credential,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            error.message || 'Failed to register credential on server.',
          );
        }

        return true;
      } catch (error) {
        console.error('Biometric registration failed:', error);
        throw error;
      }
    },
    [],
  );

  const signInWithBiometric = useCallback(async (userEmail: string) => {
    try {
      // 1. Get challenge from server
      const challengeRes = await fetch('/api/biometric/login-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!challengeRes.ok) throw new Error('Could not get login challenge.');

      const options: PublicKeyCredentialRequestOptionsJSON =
        await challengeRes.json();

      // 2. Use challenge to get assertion from authenticator
      const assertion = await getCredential(options);

      // 3. Send assertion to server for verification
      const verificationRes = await fetch('/api/biometric/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          assertion,
        }),
      });

      if (!verificationRes.ok) throw new Error('Verification failed.');

      const { customToken } = await verificationRes.json();
      
      // 4. Sign in with Firebase custom token
      await signInWithCustomToken(auth, customToken);
      
      return true;
    } catch (error) {
      console.error('Biometric sign-in failed:', error);
      throw error;
    }
  }, []);

  const unregisterBiometric = useCallback(async (userId: string) => {
     try {
      const response = await fetch('/api/biometric/unregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unregister biometric on server.');
      }
      return true;
    } catch (error) {
      console.error('Biometric unregistration failed:', error);
      throw error;
    }
  }, []);

  return { isBiometricSupported, registerBiometric, signInWithBiometric, unregisterBiometric };
};
