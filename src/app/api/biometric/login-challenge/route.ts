
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

import { config } from '@/lib/config';

const RP_ID = config.auth.rpId;
const BIOMETRIC_SIGN_IN_UNAVAILABLE = 'Biometric sign-in unavailable.';

const getProfileForBiometricSignIn = async (
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
    const { userId, email } = await req.json();

    if (!userId && !email) {
      return NextResponse.json({ message: 'Biometric sign-in request is invalid.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const profile = await getProfileForBiometricSignIn(supabase, { userId, email });

    if (!profile || !profile.biometric_credential_id || !profile.biometric_credential_public_key) {
      return NextResponse.json(
        { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
        { status: 401 },
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
  } catch (error: unknown) {
    console.error('Error generating login challenge:', error);
    return NextResponse.json(
      { message: BIOMETRIC_SIGN_IN_UNAVAILABLE },
      { status: 500 },
    );
  }
}
