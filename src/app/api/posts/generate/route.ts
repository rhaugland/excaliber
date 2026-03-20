import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scanAllSources } from '@/lib/rss/scanner';
import { generatePosts } from '@/lib/ai/generate-posts';

export async function POST(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('client_profile')
    .select('*')
    .eq('id', clientId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: sources } = await supabase
    .from('content_sources')
    .select('name, url, category')
    .eq('client_id', clientId)
    .eq('active', true);

  const articles = await scanAllSources(sources || []);

  const { data: signals } = await supabase
    .from('voice_signals')
    .select('action, original_draft, edited_version, time_spent_ms')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(30);

  const posts = await generatePosts(profile, articles, signals || []);

  if (posts.length > 0) {
    const rows = posts.map((p) => ({
      client_id: clientId,
      content: p.content,
      category: p.category,
      status: 'suggested',
      source_context: p.sourceContext,
      source_url: p.sourceUrl,
      ai_model_version: 'claude-sonnet-4-20250514',
    }));

    const { error } = await supabase.from('posts').insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (sources) {
    for (const source of sources) {
      await supabase
        .from('content_sources')
        .update({ last_fetched_at: new Date().toISOString(), fetch_status: 'ok' })
        .eq('url', source.url)
        .eq('client_id', clientId);
    }
  }

  return NextResponse.json({ generated: posts.length });
}
