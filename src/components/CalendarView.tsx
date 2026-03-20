'use client';

import { useState } from 'react';
import type { Post } from '@/lib/supabase/types';

interface CalendarViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  business_insight: 'border-l-blue-500',
  leadership: 'border-l-purple-500',
  personal: 'border-l-amber-500',
};

export default function CalendarView({ posts, onPostClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      if (!p.scheduled_time) return false;
      const d = new Date(p.scheduled_time);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(<div key={`empty-${i}`} />);
  for (let day = 1; day <= daysInMonth; day++) {
    const dayPosts = getPostsForDay(day);
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    days.push(
      <div key={day} className="min-h-[3rem] p-1">
        <div className={`text-xs text-center mb-1 w-6 h-6 flex items-center justify-center mx-auto rounded-full ${
          isToday ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)]'
        }`}>{day}</div>
        {dayPosts.map((p) => (
          <button key={p.id} onClick={() => onPostClick(p)}
            className={`w-full text-left text-[10px] bg-[var(--bg-elevated)] rounded px-1 py-0.5 mb-0.5 truncate border-l-2 ${CATEGORY_COLORS[p.category]}`}>
            {p.content.slice(0, 30)}...
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={prevMonth} className="text-[var(--text-secondary)] text-lg px-2">‹</button>
        <h2 className="font-semibold">{monthLabel}</h2>
        <button onClick={nextMonth} className="text-[var(--text-secondary)] text-lg px-2">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-[var(--text-muted)] px-2 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (<div key={d}>{d}</div>))}
      </div>
      <div className="grid grid-cols-7 px-2 gap-px">{days}</div>
    </div>
  );
}
