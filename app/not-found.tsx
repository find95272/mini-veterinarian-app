'use client';

import Link from 'next/link';
import { Home, PawPrint } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="relative mb-6 inline-block">
          <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto" role="img" aria-label="404">
            <title>页面未找到</title>
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="60" cy="60" r="36" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x="60" y="68" textAnchor="middle" fill="hsl(var(--primary))" fontSize="24" fontWeight="bold" fontFamily="sans-serif">404</text>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">页面走丢了</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          你访问的页面不存在或已被移动。让我们带你回到安全的地方。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/70 transition-colors"
          >
            <PawPrint className="w-4 h-4" />
            我的宠物
          </Link>
        </div>
      </div>
    </main>
  );
}
