'use client';

import { useEffect, useRef } from 'react';

export default function Confetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; rot: number; vrot: number; shape: string }> = [];
    const colors = ['#0d9488', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#ec4899'];
    const shapes = ['rect', 'circle'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -8 - 4,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let frame = 0;
    const maxFrames = 120;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      frame++;
      if (frame < maxFrames) requestAnimationFrame(animate);
    };

    animate();
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="fixed inset-0 z-[90] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
