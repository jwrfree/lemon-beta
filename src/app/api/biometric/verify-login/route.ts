
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

import { config } from '@/lib/config';

const RP_ID = config.auth.rpId;
const ORIGIN = config.auth.origin;
const BIOMETRIC_SIGN_IN_UNAVAILABLE = 'Biometric sign-in unavailable.';

function base64UrlToBuffer(base64urlString: string): Buffer {
  const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
  return Buffer.from(padded, 'base64');
}

const getProfileForBiometricVerification = async (
  supabase: ReturnType<typeof createAdminClient>,
  identity: { userId?: string | null; email?: string | null },
) => {
  if (identity.userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', identity.userId)
      .maybeSingle();

    if (data) return data;
  }

  if (identity.email) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', identity.email)
      .maybeSingle();

    if (data) return data;
  }

  return null;
};

export async function POST(req: NextRequest) {
  try {
    const { userId, email, assertion } = await req.json();

    if ((!userId && !email) || !assertion) {
      return NextResponse.json(
        { message: 'Biometric sign-in request is invalid.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const profile = await getProfileForBiometricVerification(supabase, { userId, email });

    if (
      !profile ||
      !profile.biometric_credential_id ||
      !profile.biometric_credential_public_key ||
      !profile.login_challenge
    ) {
      return NextResponse.json(
        { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
        { status: 401 },
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: assertion as AuthenticationResponseJSON,
      expectedChallenge: profile.login_challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: profile.biometric_credential_id,
        credentialPublicKey: base64UrlToBuffer(
          profile.biometric_credential_public_key,
        ),
        counter: profile.biometric_counter || 0,
        transports: ['internal'],
      },
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json(
        { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
        { status: 401 },
      );
    }

    const { newCounter } = verification.authenticationInfo;

    // Update profile
    await supabase.from('profiles').update({
        login_challenge: null,
        biometric_counter: newCounter,
        is_biometric_enabled: true
    }).eq('id', profile.id);

    if (!profile.email) {
      return NextResponse.json(
        { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
        { status: 401 },
      );
    }

    // Keep the existing post-verification bridge to a Supabase session.
    // The session is still granted only after a successful WebAuthn verification above.
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
    });

    if (linkError || !linkData.properties?.action_link) {
        throw new Error('Failed to generate session link.');
    }

    return NextResponse.json({ success: true, redirectUrl: linkData.properties.action_link });
  } catch (error: unknown) {
    console.error('Biometric verification error:', error);
    return NextResponse.json(
      { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
      { status: 500 },
    );
  }
}
