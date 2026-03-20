'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  id: string;
  content: string;
  category: string;
  sourceContext: string | null;
  onSwipe: (direction: 'left' | 'right') => void;
  onEdit: () => void;
  onSave: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  business_insight: 'bg-blue-600',
  leadership: 'bg-purple-600',
  personal: 'bg-amber-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  business_insight: 'Business Insight',
  leadership: 'Leadership',
  personal: 'Personal',
};

export default function SwipeCard({
  content, category, sourceContext, onSwipe, onEdit, onSave,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe('right');
        else if (info.offset.x < -100) onSwipe('left');
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 mx-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--accent-blue)] rounded-full flex items-center justify-center text-white font-bold">O</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Ottera TV CEO</div>
            <div className="text-xs text-[var(--text-muted)]">CEO & Founder</div>
          </div>
          <span className={`${CATEGORY_COLORS[category]} text-white text-xs px-2 py-1 rounded-full`}>
            {CATEGORY_LABELS[category]}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-[var(--text-primary)] mb-4">{content}</div>
        {sourceContext && (
          <div className="text-xs text-[var(--text-muted)] mb-4 italic">Inspired by: {sourceContext}</div>
        )}
        <div className="flex justify-center gap-4">
          <button onClick={() => onSwipe('left')} className="w-14 h-14 bg-[var(--accent-red)] rounded-full flex items-center justify-center text-xl">✕</button>
          <button onClick={onEdit} className="w-14 h-14 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-xl">✏️</button>
          <button onClick={onSave} className="w-14 h-14 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-xl">🔖</button>
          <button onClick={() => onSwipe('right')} className="w-14 h-14 bg-[var(--accent-green)] rounded-full flex items-center justify-center text-xl">✓</button>
        </div>
        <div className="flex justify-center gap-8 mt-2 text-xs text-[var(--text-muted)]">
          <span>Skip</span><span>Edit</span><span>Save</span><span>Post</span>
        </div>
      </div>
    </motion.div>
  );
}
