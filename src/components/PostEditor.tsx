'use client';

import { useState } from 'react';

interface PostEditorProps {
  content: string;
  onSave: (editedContent: string) => void;
  onCancel: () => void;
}

export default function PostEditor({ content, onSave, onCancel }: PostEditorProps) {
  const [text, setText] = useState(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-elevated)]">
        <button onClick={onCancel} className="text-[var(--text-secondary)]">Cancel</button>
        <span className="text-sm font-semibold">Edit Post</span>
        <button onClick={() => onSave(text)} className="text-[var(--accent-blue)] font-semibold">Done</button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 text-sm leading-relaxed resize-none focus:outline-none"
        autoFocus
      />
      <div className="px-4 py-2 text-xs text-[var(--text-muted)] border-t border-[var(--bg-elevated)]">
        {wordCount} words · {wordCount < 50 ? 'Punchy' : wordCount <= 250 ? 'Optimal' : 'Long'}
      </div>
    </div>
  );
}
