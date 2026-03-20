import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'suggested';
  const supabase = createServiceClient();
  const { data: posts, error } = await supabase
    .from('posts').select('*').eq('client_id', clientId).eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(posts);
}

export async function PATCH(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id, status, content, scheduled_time } = await request.json();
  const supabase = createServiceClient();
  const update: Record<string, unknown> = { status };
  if (content) update.content = content;
  if (scheduled_time) update.scheduled_time = scheduled_time;
  const { error } = await supabase.from('posts').update(update).eq('id', id).eq('client_id', clientId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
