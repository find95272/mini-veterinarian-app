'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';

interface ShareableCardProps {
  displayName: string;
  level: number;
  xp: number;
  streak: number;
  petCount: number;
  badgeCount: number;
  avatarUrl?: string | null;
}

export default function ShareableCard({
  displayName, level, xp, streak, petCount, badgeCount, avatarUrl,
}: ShareableCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(0, 0, 600, 340);
      ctx.drawImage(img, 0, 0, 600, 340);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = 'mini-vet-card.png';
        a.click();
        URL.revokeObjectURL(dlUrl);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox="0 0 600 340"
        className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
        role="img"
        aria-label="分享卡片"
      >
        <defs>
          <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width="600" height="340" rx="20" fill="url(#cardBg)" />
        <circle cx="500" cy="60" r="80" fill="#ffffff" opacity="0.05" />
        <circle cx="100" cy="280" r="60" fill="#ffffff" opacity="0.05" />

        <text x="40" y="50" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif">Mini Vet</text>
        <text x="40" y="72" fill="#ffffff" opacity="0.7" fontSize="12" fontFamily="sans-serif">宠物健康守护者</text>

        <rect x="40" y="90" width="120" height="120" rx="16" fill="#ffffff" opacity="0.1" />
        {avatarUrl ? (
          <image href={avatarUrl} x="48" y="98" width="104" height="104" rx="12" clipPath="inset(0 round 12)" />
        ) : (
          <text x="100" y="160" textAnchor="middle" fill="#ffffff" opacity="0.5" fontSize="40">🐾</text>
        )}

        <text x="180" y="120" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="sans-serif">
          {displayName || '宠物主人'}
        </text>

        <rect x="180" y="135" width="60" height="24" rx="12" fill="url(#accentGrad)" />
        <text x="210" y="152" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Lv.{level}</text>

        <text x="180" y="180" fill="#ffffff" opacity="0.8" fontSize="13" fontFamily="sans-serif">{xp} XP</text>

        <line x1="40" y1="230" x2="560" y2="230" stroke="#ffffff" opacity="0.15" strokeWidth="1" />

        <g>
          <text x="80" y="265" textAnchor="middle" fill="#fbbf24" fontSize="28" fontWeight="bold" fontFamily="sans-serif">{streak}</text>
          <text x="80" y="290" textAnchor="middle" fill="#ffffff" opacity="0.6" fontSize="11" fontFamily="sans-serif">连续打卡</text>
        </g>
        <g>
          <text x="220" y="265" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="sans-serif">{petCount}</text>
          <text x="220" y="290" textAnchor="middle" fill="#ffffff" opacity="0.6" fontSize="11" fontFamily="sans-serif">宠物档案</text>
        </g>
        <g>
          <text x="360" y="265" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="sans-serif">{badgeCount}</text>
          <text x="360" y="290" textAnchor="middle" fill="#ffffff" opacity="0.6" fontSize="11" fontFamily="sans-serif">成就徽章</text>
        </g>
        <g>
          <text x="500" y="265" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="sans-serif">{Math.floor(xp / 100)}</text>
          <text x="500" y="290" textAnchor="middle" fill="#ffffff" opacity="0.6" fontSize="11" fontFamily="sans-serif">护理次数</text>
        </g>

        <text x="300" y="320" textAnchor="middle" fill="#ffffff" opacity="0.4" fontSize="10" fontFamily="sans-serif">mini-vet.app</text>
      </svg>

      <button
        onClick={downloadPng}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        下载分享卡片
      </button>
    </div>
  );
}
