import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { interests, topicMix, tonePreferences } = await request.json();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('client_profile')
    .update({
      interests,
      topic_mix: topicMix,
      tone_preferences: tonePreferences,
    })
    .eq('id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
