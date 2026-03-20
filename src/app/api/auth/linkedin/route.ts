import { NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/linkedin/oauth';
import { randomUUID } from 'crypto';

export async function GET() {
  const state = randomUUID();
  const url = buildAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
