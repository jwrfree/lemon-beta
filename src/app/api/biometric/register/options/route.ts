
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';

import { config } from '@/lib/config';

const RP_ID = config.auth.rpId;
const RP_NAME = config.auth.rpName;

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { message: 'Missing userId or email' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.id !== userId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const options = await generateRegistrationOptions({
      rpID: RP_ID,
      rpName: RP_NAME,
      userID: Buffer.from(userId),
      userName: email,
      userDisplayName: email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: profile?.biometric_credential_id
        ? [
            {
              id: profile.biometric_credential_id,
              transports: ['internal'],
            },
          ]
        : [],
    });

    await supabase.from('profiles').upsert({
        id: userId,
        login_challenge: options.challenge
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Error generating registration options:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to prepare biometric registration.' },
      { status: 500 },
    );
  }
}
