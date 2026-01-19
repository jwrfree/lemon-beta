
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

function base64UrlToBuffer(base64urlString: string): Buffer {
  const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
  return Buffer.from(padded, 'base64');
}

export async function POST(req: NextRequest) {
  try {
    const { email, assertion } = await req.json();

    if (!email || !assertion) {
      return NextResponse.json(
        { message: 'Missing email or assertion.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Fetch user profile from Supabase
    // We assume email is unique in profiles or we match auth.users
    // Better to query profiles table. 
    // BUT profiles might not have email indexed unique if not careful? 
    // Let's assume we maintain email in profiles.
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (
      !profile.biometric_credential_id ||
      !profile.biometric_credential_public_key ||
      !profile.login_challenge
    ) {
      return NextResponse.json(
        { message: 'Biometric login not set up or no challenge found.' },
        { status: 400 },
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
        { message: 'Biometric authentication failed.' },
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

    // Generate Session via Magic Link
    // We generate a link and send it back to the client to "auto-click" or redirect
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
    });

    if (linkError || !linkData.properties?.action_link) {
        throw new Error('Failed to generate session link.');
    }

    return NextResponse.json({ success: true, redirectUrl: linkData.properties.action_link });
  } catch (error: any) {
    console.error('Biometric verification error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to verify biometric login.' },
      { status: 500 },
    );
  }
}
