import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    
    if (!domain) {
      return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=unknown&sz=128`);
    }

    // Use Logo.dev CDN with publishable key (not secret key)
    const LOGO_DEV_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY;
    
    if (!LOGO_DEV_KEY) {
        console.warn('Logo.dev publishable key is missing. Using Google Favicon fallback.');
        return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    }

    // Logo.dev format: https://img.logo.dev/{domain}?key={publishable_key}
    const logoUrl = `https://img.logo.dev/${domain}?key=${LOGO_DEV_KEY}`;

    // Try to fetch from Logo.dev first
    try {
      const response = await fetch(logoUrl, { 
        method: 'HEAD',
        redirect: 'follow'
      });
      
      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        return NextResponse.redirect(logoUrl);
      } else {
        console.warn(`Logo.dev failed for ${domain}, using Google Favicon fallback`);
        return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
    } catch (fetchError) {
      console.warn(`Logo.dev fetch error for ${domain}:`, fetchError);
      return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    }

  } catch (error) {
    console.error('Logo API error:', error);
    const { domain } = await params;
    return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  }
}
