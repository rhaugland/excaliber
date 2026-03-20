import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { publishPost } from '@/lib/linkedin/api';

export async function POST(request: NextRequest) {
  const { postId } = await request.json();
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const supabase = createServiceClient();

  // Get the post
  const { data: post } = await supabase
    .from('posts')
    .select('*, client_profile!inner(linkedin_user_id, oauth_token_vault_id)')
    .eq('id', postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = (post as any).client_profile;

  // Retrieve token from Vault
  const { data: secret } = await supabase
    .from('vault.decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', profile.oauth_token_vault_id)
    .single();

  if (!secret) return NextResponse.json({ error: 'Token not found' }, { status: 401 });

  const tokens = JSON.parse(secret.decrypted_secret);
  const authorUrn = `urn:li:person:${profile.linkedin_user_id}`;

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await publishPost(tokens.access_token, authorUrn, post.content);

      // Update post status
      await supabase
        .from('posts')
        .update({
          status: 'published',
          published_time: new Date().toISOString(),
          linkedin_post_id: result.id || null,
        })
        .eq('id', postId);

      return NextResponse.json({ success: true, linkedinPostId: result.id });
    } catch (error) {
      lastError = error as Error;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  // All retries failed
  await supabase.from('posts').update({ status: 'failed' }).eq('id', postId);
  return NextResponse.json({ error: lastError?.message || 'Publish failed' }, { status: 500 });
}
