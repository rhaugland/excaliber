'use client';

import { useState } from 'react';

const RECOMMENDED_SLOTS = [
  { day: 2, hour: 8, minute: 30, label: 'Tue 8:30 AM' },
  { day: 3, hour: 9, minute: 0, label: 'Wed 9:00 AM' },
  { day: 4, hour: 8, minute: 0, label: 'Thu 8:00 AM' },
  { day: 2, hour: 10, minute: 0, label: 'Tue 10:00 AM' },
  { day: 3, hour: 10, minute: 0, label: 'Wed 10:00 AM' },
  { day: 4, hour: 9, minute: 30, label: 'Thu 9:30 AM' },
];

interface TimeSlotPickerProps {
  onSelect: (dateTime: string) => void;
  onCancel: () => void;
  scheduledTimes: string[];
}

export default function TimeSlotPicker({ onSelect, onCancel, scheduledTimes }: TimeSlotPickerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const getNextSlots = () => {
    const now = new Date();
    const slots: Array<{ dateTime: string; label: string; recommended: boolean }> = [];
    for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
      for (const slot of RECOMMENDED_SLOTS) {
        const date = new Date(now);
        const currentDay = date.getDay();
        let daysUntil = slot.day - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        daysUntil += weekOffset * 7;
        date.setDate(date.getDate() + daysUntil);
        date.setHours(slot.hour, slot.minute, 0, 0);
        if (date > now) {
          const dateTime = date.toISOString();
          const isConflict = scheduledTimes.some(
            (t) => Math.abs(new Date(t).getTime() - date.getTime()) < 3600000
          );
          if (!isConflict) {
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            slots.push({ dateTime, label: `${dayLabel} · ${timeLabel}`, recommended: weekOffset === 0 });
          }
        }
      }
    }
    return slots.slice(0, 8);
  };

  const slots = getNextSlots();

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
      <div className="bg-[var(--bg-card)] rounded-t-2xl w-full max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-elevated)]">
          <button onClick={onCancel} className="text-[var(--text-secondary)]">Cancel</button>
          <span className="text-sm font-semibold">Schedule Post</span>
          <button onClick={() => selectedSlot && onSelect(selectedSlot)}
            className="text-[var(--accent-blue)] font-semibold disabled:opacity-50" disabled={!selectedSlot}>Confirm</button>
        </div>
        <div className="p-4">
          <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wide">AI Recommended Times</p>
          <div className="space-y-2">
            {slots.map((slot) => (
              <button key={slot.dateTime} onClick={() => setSelectedSlot(slot.dateTime)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                  selectedSlot === slot.dateTime ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                }`}>
                <span className="text-sm">{slot.label}</span>
                {slot.recommended && selectedSlot !== slot.dateTime && (
                  <span className="text-xs text-[var(--accent-blue)]">Recommended</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
