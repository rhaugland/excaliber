'use client';

import { useEffect, useState } from 'react';
import SwipeStack from '@/components/SwipeStack';
import type { Post } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/posts?status=suggested')
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (
    postId: string, action: 'approved' | 'rejected' | 'saved',
    editedContent?: string, timeSpentMs?: number
  ) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const statusMap = { approved: 'scheduled', rejected: 'rejected', saved: 'saved' } as const;
    await fetch('/api/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId, status: statusMap[action], content: editedContent || undefined }),
    });
    if (action !== 'saved') {
      await fetch('/api/voice-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId, action, originalDraft: post.content,
          editedVersion: editedContent || null, timeSpentMs,
        }),
      });
    }
  };

  const handleSchedule = (postId: string) => {
    router.push(`/calendar?schedule=${postId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="px-6 mb-4">
        <h1 className="text-xl font-bold">Your Posts</h1>
        <p className="text-sm text-[var(--text-secondary)]">Swipe right to post, left to skip</p>
      </div>
      <SwipeStack posts={posts} onAction={handleAction} onSchedule={handleSchedule} />
    </div>
  );
}
