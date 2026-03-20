import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { publishPost } from '@/lib/linkedin/api';

export async function POST(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find posts due for publishing (scheduled_time <= now and status = 'scheduled')
  const { data: duePosts } = await supabase
    .from('posts')
    .select('id, content, client_id, client_profile!inner(linkedin_user_id, oauth_token_vault_id)')
    .eq('status', 'scheduled')
    .lte('scheduled_time', new Date().toISOString());

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  // Publish each due post directly (no self-HTTP call)
  let published = 0;
  for (const post of duePosts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (post as any).client_profile;
    try {
      const { data: secret } = await supabase
        .from('vault.decrypted_secrets')
        .select('decrypted_secret')
        .eq('id', profile.oauth_token_vault_id)
        .single();

      if (!secret) continue;

      const tokens = JSON.parse(secret.decrypted_secret);
      const authorUrn = `urn:li:person:${profile.linkedin_user_id}`;

      await publishPost(tokens.access_token, authorUrn, post.content);

      await supabase
        .from('posts')
        .update({ status: 'published', published_time: new Date().toISOString() })
        .eq('id', post.id);

      published++;
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error);
      await supabase.from('posts').update({ status: 'failed' }).eq('id', post.id);
    }
  }

  return NextResponse.json({ published });
}
