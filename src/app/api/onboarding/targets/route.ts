import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const clientId = request.cookies.get('excaliber_client_id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { targets } = await request.json();
  const supabase = createServiceClient();

  const defaultSources = [
    { name: 'Variety', type: 'rss', url: 'https://variety.com/feed/', category: 'streaming' },
    { name: 'Deadline', type: 'rss', url: 'https://deadline.com/feed/', category: 'streaming' },
    { name: 'AdExchanger', type: 'rss', url: 'https://www.adexchanger.com/feed/', category: 'advertising' },
    { name: 'Digiday', type: 'rss', url: 'https://digiday.com/feed/', category: 'advertising' },
    { name: 'TechCrunch', type: 'rss', url: 'https://techcrunch.com/feed/', category: 'capital' },
  ];

  const targetRows = targets.map((t: { name: string; linkedinUrl?: string; company?: string; tag?: string }) => ({
    client_id: clientId,
    name: t.name,
    linkedin_url: t.linkedinUrl || null,
    company: t.company || null,
    tag: t.tag || 'other',
  }));

  const { error: targetsError } = await supabase.from('targets').insert(targetRows);
  if (targetsError) return NextResponse.json({ error: targetsError.message }, { status: 500 });

  const sourceRows = defaultSources.map((s) => ({ ...s, client_id: clientId }));
  await supabase.from('content_sources').insert(sourceRows);

  await supabase
    .from('client_profile')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', clientId);

  return NextResponse.json({ success: true });
}
