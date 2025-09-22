
'use client';

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialDescriptorJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';

// Helper functions for WebAuthn (biometric authentication)

/**
 * Checks if WebAuthn is supported by the browser.
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * Base64URL-decodes a string into a Uint8Array.
 */
function base64UrlDecode(base64UrlString: string): Uint8Array {
  const base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + '='.repeat(padLength);
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Base64URL-encodes an ArrayBuffer.
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function decodeCredentialDescriptors(
  descriptors?: PublicKeyCredentialDescriptorJSON[],
): PublicKeyCredentialDescriptor[] | undefined {
  if (!descriptors) return undefined;

  return descriptors.map((descriptor) => ({
    id: base64UrlDecode(descriptor.id),
    type: 'public-key',
  }));
}

/**
 * Creates a new WebAuthn credential from server-provided options.
 */
export async function createCredential(
  options: PublicKeyCredentialCreationOptionsJSON,
): Promise<RegistrationResponseJSON> {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...options,
    challenge: base64UrlDecode(options.challenge),
    user: {
      ...options.user,
      id: base64UrlDecode(options.user.id),
    },
    excludeCredentials: decodeCredentialDescriptors(options.excludeCredentials),
  };

  const credential = await navigator.credentials.create({
    publicKey,
  });

  if (!credential) {
    throw new Error('Credential creation failed.');
  }

  const publicKeyCredential = credential as PublicKeyCredential;
  const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

  return {
    id: publicKeyCredential.id,
    rawId: base64UrlEncode(publicKeyCredential.rawId),
    type: 'public-key',
    authenticatorAttachment: (publicKeyCredential.authenticatorAttachment ?? undefined) as
      | AuthenticatorAttachment
      | undefined,
    clientExtensionResults: publicKeyCredential.getClientExtensionResults(),
    response: {
      clientDataJSON: base64UrlEncode(response.clientDataJSON),
      attestationObject: base64UrlEncode(response.attestationObject),
    },
  };
}

/**
 * Requests an assertion from an existing WebAuthn credential.
 */
export async function getCredential(
  options: PublicKeyCredentialRequestOptionsJSON,
): Promise<AuthenticationResponseJSON> {
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...options,
    challenge: base64UrlDecode(options.challenge),
    allowCredentials: decodeCredentialDescriptors(options.allowCredentials),
  };

  const assertion = await navigator.credentials.get({
    publicKey,
  });

  if (!assertion) {
    throw new Error('Credential assertion failed.');
  }

  const publicKeyCredential = assertion as PublicKeyCredential;
  const response = publicKeyCredential.response as AuthenticatorAssertionResponse;

  return {
    id: publicKeyCredential.id,
    rawId: base64UrlEncode(publicKeyCredential.rawId),
    type: 'public-key',
    authenticatorAttachment: (publicKeyCredential.authenticatorAttachment ?? undefined) as
      | AuthenticatorAttachment
      | undefined,
    clientExtensionResults: publicKeyCredential.getClientExtensionResults(),
    response: {
      authenticatorData: base64UrlEncode(response.authenticatorData),
      clientDataJSON: base64UrlEncode(response.clientDataJSON),
      signature: base64UrlEncode(response.signature),
      userHandle: response.userHandle
        ? base64UrlEncode(response.userHandle)
        : undefined,
    },
  };
}
