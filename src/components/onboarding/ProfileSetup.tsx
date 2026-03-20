'use client';

import { useState } from 'react';

const TOPICS = [
  'OTT/Streaming', 'FAST Channels', 'Programmatic Advertising',
  'Direct Ad Sales', 'OEM Distribution', 'Content Acquisition',
  'Capital Raising', 'M&A Strategy', 'Leadership', 'Company Culture',
];

const TONES = ['Professional', 'Conversational', 'Bold', 'Inspirational'];

interface ProfileData {
  interests: string[];
  topicMix: { business: number; leadership: number; personal: number };
  tonePreferences: string[];
}

export default function ProfileSetup({
  onComplete,
}: {
  onComplete: (data: ProfileData) => void;
}) {
  const [interests, setInterests] = useState<string[]>([
    'OTT/Streaming', 'FAST Channels', 'Programmatic Advertising',
    'OEM Distribution', 'Capital Raising',
  ]);
  const [mix, setMix] = useState({ business: 70, leadership: 20, personal: 10 });
  const [tones, setTones] = useState<string[]>(['Professional', 'Bold']);

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="px-6 py-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-1">Tell us about you</h2>
      <p className="text-[var(--text-secondary)] mb-6">Pre-filled for Ottera TV. Adjust as needed.</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleItem(topic, interests, setInterests)}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                interests.includes(topic)
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Content Mix</h3>
        {(['business', 'leadership', 'personal'] as const).map((key) => {
          const total = mix.business + mix.leadership + mix.personal;
          const normalized = total > 0 ? Math.round((mix[key] / total) * 100) : 33;
          return (
            <div key={key} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key}</span>
                <span className="text-[var(--accent-blue)]">{normalized}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mix[key]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMix((prev) => ({ ...prev, [key]: val }));
                }}
                className="w-full accent-[var(--accent-blue)]"
              />
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Tone</h3>
        <div className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => toggleItem(tone, tones, setTones)}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                tones.includes(tone)
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onComplete({ interests, topicMix: mix, tonePreferences: tones })}
        className="w-full bg-[var(--accent-blue)] text-white py-4 rounded-xl font-semibold text-lg"
      >
        Continue
      </button>
    </div>
  );
}
