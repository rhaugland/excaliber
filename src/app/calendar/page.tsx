'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CalendarView from '@/components/CalendarView';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import type { Post } from '@/lib/supabase/types';

function CalendarContent() {
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const searchParams = useSearchParams();
  const schedulePostId = searchParams.get('schedule');

  useEffect(() => {
    fetch('/api/posts?status=scheduled')
      .then((r) => r.json())
      .then((data) => setScheduledPosts(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (schedulePostId) {
      setShowPicker(true);
    }
  }, [schedulePostId]);

  const handleTimeSelect = async (dateTime: string) => {
    const postId = schedulePostId || selectedPost?.id;
    if (!postId) return;
    await fetch('/api/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postId, status: 'scheduled', scheduled_time: dateTime }),
    });
    setShowPicker(false);
    setSelectedPost(null);
    const res = await fetch('/api/posts?status=scheduled');
    const data = await res.json();
    setScheduledPosts(Array.isArray(data) ? data : []);
  };

  const scheduledTimes = scheduledPosts.map((p) => p.scheduled_time).filter((t): t is string => !!t);

  const upcoming = [...scheduledPosts]
    .filter((p) => p.scheduled_time)
    .sort((a, b) => new Date(a.scheduled_time!).getTime() - new Date(b.scheduled_time!).getTime());

  return (
    <div className="pt-4">
      <div className="px-6 mb-4">
        <h1 className="text-xl font-bold">Calendar</h1>
        <p className="text-sm text-[var(--text-secondary)]">{scheduledPosts.length} posts scheduled</p>
      </div>
      <CalendarView posts={scheduledPosts} onPostClick={(p) => { setSelectedPost(p); setShowPicker(true); }} />
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No posts scheduled yet. Swipe right on posts to schedule them.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((post) => {
              const date = new Date(post.scheduled_time!);
              const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              return (
                <div key={post.id} className={`bg-[var(--bg-card)] rounded-xl p-3 border-l-4 ${
                  post.category === 'business_insight' ? 'border-l-blue-500' :
                  post.category === 'leadership' ? 'border-l-purple-500' : 'border-l-amber-500'
                }`}>
                  <div className="text-xs text-[var(--text-muted)] mb-1">{dayLabel} · {timeLabel}</div>
                  <div className="text-sm text-[var(--text-primary)] line-clamp-2">{post.content}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showPicker && (
        <TimeSlotPicker onSelect={handleTimeSelect} onCancel={() => { setShowPicker(false); setSelectedPost(null); }} scheduledTimes={scheduledTimes} />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="pt-4 px-6"><div className="h-8 w-32 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" /><div className="h-4 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" /></div>}>
      <CalendarContent />
    </Suspense>
  );
}
