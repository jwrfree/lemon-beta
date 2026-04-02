
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isWebAuthnSupported,
  createCredential,
  getCredential,
} from '@/lib/webauthn';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

type BiometricIdentity = {
  userId?: string | null;
  email?: string | null;
};

const BIOMETRIC_STORAGE_KEY = 'lemon_biometric_user';

const getStoredBiometricIdentity = (): BiometricIdentity | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BiometricIdentity;
    if (!parsed?.userId && !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

const storeBiometricIdentity = (identity: BiometricIdentity) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(identity));
};

const clearStoredBiometricIdentity = (userId?: string) => {
  if (typeof window === 'undefined') return;

  if (!userId) {
    window.localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
    return;
  }

  const stored = getStoredBiometricIdentity();
  if (stored?.userId === userId) {
    window.localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  }
};

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

        storeBiometricIdentity({ userId, email: userEmail });

        return true;
      } catch (error) {
        console.error('Biometric registration failed:', error);
        throw error;
      }
    },
    [],
  );

  const signInWithBiometric = useCallback(async (identity: string | BiometricIdentity) => {
    try {
      const storedIdentity = getStoredBiometricIdentity();
      const nextIdentity: BiometricIdentity =
        typeof identity === 'string'
          ? {
              email: identity,
              userId:
                storedIdentity?.email === identity ? storedIdentity.userId : undefined,
            }
          : {
              userId: identity.userId ?? storedIdentity?.userId,
              email: identity.email ?? storedIdentity?.email,
            };

      if (!nextIdentity.userId && !nextIdentity.email) {
        throw new Error('Biometric sign-in is not configured on this device.');
      }

      // 1. Get challenge from server
      const challengeRes = await fetch('/api/biometric/login-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextIdentity),
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
          ...nextIdentity,
          assertion,
        }),
      });

      if (!verificationRes.ok) throw new Error('Verification failed.');

      const { redirectUrl } = await verificationRes.json();
      
      // 4. Redirect to Supabase Magic Link to verify session
      if (redirectUrl) {
          window.location.href = redirectUrl;
      } else {
          throw new Error('No redirect URL provided.');
      }
      
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
      clearStoredBiometricIdentity(userId);
      return true;
    } catch (error) {
      console.error('Biometric unregistration failed:', error);
      throw error;
    }
  }, []);

  return { isBiometricSupported, registerBiometric, signInWithBiometric, unregisterBiometric };
};
