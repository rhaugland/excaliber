import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { postId, action, originalDraft, editedVersion, timeSpentMs } = await request.json();
  const supabase = createServiceClient();
  const { error } = await supabase.from('voice_signals').insert({
    client_id: clientId, post_id: postId, action,
    original_draft: originalDraft, edited_version: editedVersion || null,
    time_spent_ms: timeSpentMs || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
