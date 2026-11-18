'use client';

import { useRef } from 'react';

interface MilestoneCardProps {
  displayName: string;
  level: number;
  xp: number;
  streak: number;
  petCount: number;
  badgeCount: number;
  avatarUrl?: string | null;
}

export default function MilestoneCard(props: MilestoneCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadCard = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini-vet-milestone-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCard = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    try {
      await navigator.clipboard.writeText(svgStr);
      alert('已复制到剪贴板！');
    } catch {
      alert('复制失败，请使用下载功能。');
    }
  };

  const initial = (props.displayName || '?')[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
        <svg ref={svgRef} viewBox="0 0 400 240" className="w-full">
          <defs>
            <linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(175 60% 38%)" />
              <stop offset="100%" stopColor="hsl(200 40% 20%)" />
            </linearGradient>
            <linearGradient id="card-accent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(35 80% 58%)" />
              <stop offset="100%" stopColor="hsl(175 60% 50%)" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" rx="16" fill="url(#card-bg)" />
          <circle cx="320" cy="40" r="60" fill="white" opacity="0.05" />
          <circle cx="60" cy="200" r="40" fill="white" opacity="0.05" />

          <text x="24" y="36" fill="white" fontSize="14" fontWeight="700" opacity="0.7">Mini Vet 里程碑</text>

          <circle cx="48" cy="80" r="28" fill="white" opacity="0.15" />
          {props.avatarUrl ? (
            <image href={props.avatarUrl} x="24" y="56" width="48" height="48" clipPath="circle(24px at 48px 80px)" />
          ) : (
            <text x="48" y="88" textAnchor="middle" fill="white" fontSize="24" fontWeight="700">{initial}</text>
          )}

          <text x="88" y="76" fill="white" fontSize="20" fontWeight="700">{props.displayName || '宠物主人'}</text>
          <text x="88" y="96" fill="white" fontSize="12" opacity="0.7">Lv.{props.level} · {props.xp} XP</text>

          <rect x="24" y="116" width="352" height="1" fill="white" opacity="0.15" />

          <g transform="translate(24, 140)">
            <text fill="white" fontSize="11" opacity="0.6">连续打卡</text>
            <text fill="url(#card-accent)" fontSize="28" fontWeight="700">{props.streak}</text>
            <text fill="white" fontSize="11" opacity="0.6" y="14">天</text>
          </g>
          <g transform="translate(124, 140)">
            <text fill="white" fontSize="11" opacity="0.6">宠物档案</text>
            <text fill="url(#card-accent)" fontSize="28" fontWeight="700">{props.petCount}</text>
            <text fill="white" fontSize="11" opacity="0.6" y="14">只</text>
          </g>
          <g transform="translate(224, 140)">
            <text fill="white" fontSize="11" opacity="0.6">获得徽章</text>
            <text fill="url(#card-accent)" fontSize="28" fontWeight="700">{props.badgeCount}</text>
            <text fill="white" fontSize="11" opacity="0.6" y="14">枚</text>
          </g>

          <text x="24" y="220" fill="white" fontSize="10" opacity="0.4">
            Mini Veterinarian · {new Date().toLocaleDateString('zh-CN')}
          </text>
          <text x="376" y="220" textAnchor="end" fill="white" fontSize="10" opacity="0.4">
            mini-vet.app
          </text>
        </svg>
      </div>
      <div className="flex gap-2">
        <button
          onClick={downloadCard}
          className="flex-1 text-sm bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          下载 SVG 卡片
        </button>
        <button
          onClick={copyCard}
          className="flex-1 text-sm bg-secondary text-secondary-foreground py-2.5 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
        >
          复制到剪贴板
        </button>
      </div>
    </div>
  );
}
