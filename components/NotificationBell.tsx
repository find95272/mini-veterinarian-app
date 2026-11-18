'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  type: 'reminder' | 'milestone' | 'info';
  time: string;
  read: boolean;
}

export default function NotificationBell({
  reminders = [],
  petCount = 0,
  streak = 0,
}: {
  reminders?: Array<{ id: string; title: string; due_date: string; completed: boolean }>;
  petCount?: number;
  streak?: number;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items: NotificationItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    reminders
      .filter((r) => !r.completed && r.due_date <= today)
      .slice(0, 5)
      .forEach((r) => {
        items.push({
          id: r.id,
          title: r.title,
          desc: '提醒已到期，请及时处理',
          type: 'reminder',
          time: r.due_date,
          read: false,
        });
      });

    if (streak > 0 && streak % 7 === 0) {
      items.push({
        id: 'streak-milestone',
        title: `连续打卡 ${streak} 天！`,
        desc: '坚持就是胜利，继续加油',
        type: 'milestone',
        time: today,
        read: false,
      });
    }

    if (petCount > 0 && petCount % 3 === 0) {
      items.push({
        id: 'multi-pet',
        title: '多宠家庭成就解锁',
        desc: `已管理 ${petCount} 只宠物档案`,
        type: 'milestone',
        time: today,
        read: false,
      });
    }

    setNotifications(items);
  }, [reminders, petCount, streak]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
        className="relative inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
        aria-label={`通知 ${unread > 0 ? `(${unread}条未读)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-foreground">通知中心</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto styled-scroll">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 px-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-success/40 mb-2" />
                <p className="text-xs text-muted-foreground">暂无新通知</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/40 last:border-0 ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.type === 'reminder' ? 'bg-warning/10 text-warning' :
                    n.type === 'milestone' ? 'bg-primary/10 text-primary' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {n.type === 'reminder' ? <Clock className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{n.time}
                    </div>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
