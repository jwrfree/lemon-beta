
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        biometric_credential_id: null,
        biometric_credential_public_key: null,
        biometric_counter: 0,
        login_challenge: null,
        is_biometric_enabled: false,
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unregistering biometric credential:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to unregister biometric credential.' },
      { status: 500 },
    );
  }
}
