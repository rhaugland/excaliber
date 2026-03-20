import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/linkedin/oauth';
import { getLinkedInProfile } from '@/lib/linkedin/api';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('linkedin_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/onboarding?error=oauth_failed', request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await getLinkedInProfile(tokens.access_token);

    const supabase = createServiceClient();

    // Store tokens in Supabase Vault
    const { data: vaultData } = await supabase
      .from('vault.secrets')
      .insert({ secret: JSON.stringify(tokens), name: `linkedin_tokens_${profile.sub}` })
      .select('id')
      .single();

    // Upsert client profile
    const { data: client, error } = await supabase
      .from('client_profile')
      .upsert({
        name: profile.name || 'Client',
        linkedin_user_id: profile.sub,
        oauth_token_vault_id: vaultData?.id || null,
        bio: profile.email || null,
      }, { onConflict: 'linkedin_user_id' })
      .select()
      .single();

    if (error) throw error;

    const response = NextResponse.redirect(new URL('/onboarding?step=2', request.url));
    response.cookies.set('excaliber_client_id', client.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    response.cookies.delete('linkedin_oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/onboarding?error=oauth_failed', request.url));
  }
}
