
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

import { config } from '@/lib/config';

const RP_ID = config.auth.rpId;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !profile) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (!profile.biometric_credential_id || !profile.biometric_credential_public_key) {
      return NextResponse.json(
        { message: 'Biometric login not enabled for this user.' },
        { status: 400 },
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: [
        {
          id: profile.biometric_credential_id,
          transports: ['internal'],
        },
      ],
    });

    await supabase.from('profiles').update({
        login_challenge: options.challenge
    }).eq('id', profile.id);

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Error generating login challenge:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to prepare biometric login.' },
      { status: 500 },
    );
  }
}
