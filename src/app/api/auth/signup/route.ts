import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

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
                        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                        const { maxAge: _m, expires: _e, ...restOptions } = options ?? {};
                        response.cookies.set(name, value, {
                            ...restOptions,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                        });
                    });
                },
            },
        },
    );

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return the response object that has cookies attached from the setAll callback
    return response;
}
