'use client';

import { useState } from 'react';
import type { TargetTag } from '@/lib/supabase/types';

interface TargetEntry {
  name: string;
  linkedinUrl: string;
  company: string;
  tag: TargetTag;
}

export default function TargetSetup({
  onComplete,
}: {
  onComplete: (targets: TargetEntry[]) => void;
}) {
  const [targets, setTargets] = useState<TargetEntry[]>([]);
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [company, setCompany] = useState('');
  const [tag, setTag] = useState<TargetTag>('peer');

  const addTarget = () => {
    if (!name.trim()) return;
    setTargets([...targets, { name, linkedinUrl, company, tag }]);
    setName('');
    setLinkedinUrl('');
    setCompany('');
    setTag('peer');
  };

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const TAGS: TargetTag[] = ['investor', 'partner', 'acquirer', 'peer', 'other'];

  return (
    <div className="px-6 py-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-1">Set your targets</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        People and companies you want to build relationships with.
      </p>

      <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--bg-elevated)] text-white px-3 py-2 rounded-lg mb-2 text-sm" />
        <input type="text" placeholder="LinkedIn URL (optional)" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
          className="w-full bg-[var(--bg-elevated)] text-white px-3 py-2 rounded-lg mb-2 text-sm" />
        <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)}
          className="w-full bg-[var(--bg-elevated)] text-white px-3 py-2 rounded-lg mb-2 text-sm" />
        <div className="flex gap-2 mb-3 flex-wrap">
          {TAGS.map((t) => (
            <button key={t} onClick={() => setTag(t)}
              className={`px-2 py-1 rounded text-xs capitalize transition ${
                tag === t ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={addTarget}
          className="w-full bg-[var(--bg-elevated)] text-[var(--accent-blue)] py-2 rounded-lg text-sm font-medium">
          + Add Target
        </button>
      </div>

      {targets.length > 0 && (
        <div className="space-y-2 mb-6">
          {targets.map((t, i) => (
            <div key={i} className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg px-4 py-3">
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{t.company} · {t.tag}</div>
              </div>
              <button onClick={() => removeTarget(i)} className="text-[var(--accent-red)] text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] text-center mb-4">
        {targets.length < 5 ? `Add at least ${5 - targets.length} more to activate Relationship Radar` : `${targets.length} targets added`}
      </p>

      <button onClick={() => onComplete(targets)}
        className="w-full bg-[var(--accent-blue)] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
        disabled={targets.length === 0}>
        Finish Setup
      </button>
    </div>
  );
}
