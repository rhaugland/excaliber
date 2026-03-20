'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import PostEditor from './PostEditor';
import type { Post } from '@/lib/supabase/types';

interface SwipeStackProps {
  posts: Post[];
  onAction: (postId: string, action: 'approved' | 'rejected' | 'saved', editedContent?: string, timeSpentMs?: number) => void;
  onSchedule: (postId: string) => void;
}

export default function SwipeStack({ posts, onAction, onSchedule }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  const currentPost = posts[currentIndex];
  const getTimeSpent = () => Date.now() - cardStartTime;

  const advance = () => {
    setCurrentIndex((i) => i + 1);
    setCardStartTime(Date.now());
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentPost) return;
    const timeSpent = getTimeSpent();
    if (direction === 'right') {
      onAction(currentPost.id, 'approved', undefined, timeSpent);
      onSchedule(currentPost.id);
    } else {
      onAction(currentPost.id, 'rejected', undefined, timeSpent);
    }
    advance();
  };

  const handleSave = () => {
    if (!currentPost) return;
    onAction(currentPost.id, 'saved', undefined, getTimeSpent());
    advance();
  };

  const handleEditSave = (editedContent: string) => {
    if (!currentPost) return;
    onAction(currentPost.id, 'approved', editedContent, getTimeSpent());
    setEditing(null);
    onSchedule(currentPost.id);
    advance();
  };

  if (!currentPost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-xl font-bold mb-2">All caught up!</h2>
        <p className="text-[var(--text-secondary)]">New posts will be generated tomorrow morning.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <AnimatePresence>
        <SwipeCard
          key={currentPost.id}
          id={currentPost.id}
          content={currentPost.content}
          category={currentPost.category}
          sourceContext={currentPost.source_context}
          onSwipe={handleSwipe}
          onEdit={() => setEditing(currentPost.id)}
          onSave={handleSave}
        />
      </AnimatePresence>
      {editing && (
        <PostEditor content={currentPost.content} onSave={handleEditSave} onCancel={() => setEditing(null)} />
      )}
      <div className="absolute top-2 right-6 text-xs text-[var(--text-muted)]">
        {currentIndex + 1} / {posts.length}
      </div>
    </div>
  );
}
