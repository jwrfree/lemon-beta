
'use client';

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
 * Base64URL-decodes a string.
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
 * Base64URL-encodes a buffer.
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


interface CreateCredentialOptions {
  rpName: string;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  challenge: Uint8Array;
}

/**
 * Creates a new WebAuthn credential.
 */
export async function createCredential(options: CreateCredentialOptions) {
  const pubKeyCredParams: PublicKeyCredentialParameters[] = [
    { type: 'public-key', alg: -7 }, // ES256
    { type: 'public-key', alg: -257 }, // RS256
  ];

  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { name: options.rpName },
      user: {
        id: new TextEncoder().encode(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      challenge: options.challenge,
      pubKeyCredParams,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required'
      },
      timeout: 60000,
      attestation: 'none',
    },
  });

  if (!credential) {
    throw new Error('Credential creation failed.');
  }

  const publicKeyCredential = credential as PublicKeyCredential;

  const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

  return {
    id: publicKeyCredential.id,
    rawId: base64UrlEncode(publicKeyCredential.rawId),
    type: publicKeyCredential.type,
    response: {
        clientDataJSON: base64UrlEncode(response.clientDataJSON),
        attestationObject: base64UrlEncode(response.attestationObject),
    },
  };
}


interface GetCredentialOptions {
    challenge: Uint8Array,
    allowCredentials: PublicKeyCredentialDescriptor[]
}

/**
 * Gets a WebAuthn credential assertion.
 */
export async function getCredential(options: GetCredentialOptions) {
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: options.challenge,
            allowCredentials: options.allowCredentials,
            userVerification: 'required',
            timeout: 60000,
        },
    });

    if (!assertion) {
        throw new Error('Credential assertion failed.');
    }
    
    const publicKeyCredential = assertion as PublicKeyCredential;
    const response = publicKeyCredential.response as AuthenticatorAssertionResponse;

    return {
        id: publicKeyCredential.id,
        rawId: base64UrlEncode(publicKeyCredential.rawId),
        type: publicKeyCredential.type,
        response: {
            authenticatorData: base64UrlEncode(response.authenticatorData),
            clientDataJSON: base64UrlEncode(response.clientDataJSON),
            signature: base64UrlEncode(response.signature),
            userHandle: response.userHandle ? base64UrlEncode(response.userHandle) : null,
        },
    };
}
