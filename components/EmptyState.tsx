'use client';

import { PawPrint, Search, Bell, Bookmark, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'pet' | 'plan' | 'reminder' | 'timeline' | 'stats';
  title: string;
  desc: string;
  action?: React.ReactNode;
}

const ICONS = {
  pet: PawPrint,
  plan: Bookmark,
  reminder: Bell,
  timeline: Search,
  stats: BarChart3,
};

export default function EmptyState({ icon = 'pet', title, desc, action }: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg viewBox="0 0 120 100" className="w-28 h-24 mb-4" role="img" aria-label={title}>
        <title>{title}</title>
        <ellipse cx="60" cy="80" rx="40" ry="8" fill="hsl(var(--muted))" opacity="0.5" />
        <circle cx="60" cy="50" r="22" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
        <Icon className="w-8 h-8" style={{ color: 'hsl(var(--muted-foreground))' }} x="46" y="36" />
        <circle cx="35" cy="30" r="3" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="85" cy="25" r="2" fill="hsl(var(--accent))" opacity="0.4" />
        <circle cx="90" cy="65" r="2.5" fill="hsl(var(--primary))" opacity="0.2" />
      </svg>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-4">{desc}</p>
      {action}
    </div>
  );
}
