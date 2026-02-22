import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
    const { email, password, remember } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const shouldRemember = remember === true;

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Omit Supabase-supplied maxAge/expires; we control cookie lifetime below
                        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                        const { maxAge: _m, expires: _e, ...restOptions } = options ?? {};
                        response.cookies.set(name, value, {
                            ...restOptions,
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            ...(shouldRemember ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
                        });
                    });
                },
            },
        },
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        let message = 'Gagal masuk. Coba lagi ya.';
        if (error.message.includes('Invalid login credentials')) {
            message = 'Email atau password salah.';
        } else {
            message = error.message;
        }
        return NextResponse.json({ error: message }, { status: 401 });
    }

    return response;
}
