'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/replies', label: 'Replies', icon: '💬' },
  { href: '/radar', label: 'Radar', icon: '📡' },
  { href: '/analytics', label: 'Stats', icon: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/onboarding')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--bg-elevated)] z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 text-xs transition ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
