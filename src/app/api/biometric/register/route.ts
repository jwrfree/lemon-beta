
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

import { config } from '@/lib/config';

const RP_ID = config.auth.rpId;
const ORIGIN = config.auth.origin;

function bufferToBase64Url(buffer: Uint8Array | ArrayBuffer): string {
  const byteArray = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Buffer.from(byteArray)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, credential } = await req.json();

    if (!userId || !credential) {
      return NextResponse.json(
        { message: 'Missing userId or credential' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ message: 'User profile does not exist.' }, { status: 404 });
    }

    // Note: We reused login_challenge for registration in the previous step
    if (!profile.login_challenge) {
      return NextResponse.json(
        { message: 'No registration challenge found for user.' },
        { status: 400 },
      );
    }

    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: profile.login_challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { message: 'Failed to verify biometric registration.' },
        { status: 400 },
      );
    }

    const { credentialID, credentialPublicKey, counter } =
      verification.registrationInfo;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        biometric_credential_id: credentialID,
        biometric_credential_public_key: bufferToBase64Url(credentialPublicKey),
        biometric_counter: counter,
        is_biometric_enabled: true,
        login_challenge: null,
        email: email ?? profile.email,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error verifying biometric registration:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to register biometric credential.' },
      { status: 500 },
    );
  }
}
