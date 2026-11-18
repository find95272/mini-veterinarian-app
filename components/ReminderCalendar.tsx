'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ReminderItem {
  id: string;
  pet_id: string;
  reminder_type: string;
  title: string;
  due_date: string;
  completed: boolean;
}

interface ReminderCalendarProps {
  reminders: ReminderItem[];
  petName: (petId: string) => string;
}

const TYPE_COLORS: Record<string, string> = {
  vaccine: 'bg-primary',
  deworming: 'bg-warning',
  checkup: 'bg-accent',
  medication: 'bg-destructive',
};

const TYPE_LABELS: Record<string, string> = {
  vaccine: '疫苗',
  deworming: '驱虫',
  checkup: '体检',
  medication: '用药',
};

export default function ReminderCalendar({ reminders, petName }: ReminderCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const remindersByDate = new Map<string, ReminderItem[]>();
  for (const r of reminders) {
    const dateKey = r.due_date.slice(0, 10);
    if (!remindersByDate.has(dateKey)) remindersByDate.set(dateKey, []);
    remindersByDate.get(dateKey)!.push(r);
  }

  const today = new Date().toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const upcoming = reminders
    .filter((r) => !r.completed && new Date(r.due_date) >= new Date())
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">
            {year}年{month + 1}月
          </h4>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="w-7 h-7 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="w-7 h-7 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayReminders = remindersByDate.get(dateStr) || [];
            const isToday = dateStr === today;
            return (
              <div
                key={i}
                className={`min-h-[44px] rounded-lg p-1 text-center relative ${
                  isToday ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-secondary/30'
                } transition-colors`}
              >
                <div className={`text-[11px] ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{day}</div>
                {dayReminders.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {dayReminders.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[r.reminder_type] || 'bg-primary'} ${r.completed ? 'opacity-40' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/40">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[type]}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            即将到期
          </h4>
          <div className="space-y-2">
            {upcoming.map((r) => {
              const daysUntil = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 86400000);
              return (
                <div key={r.id} className="flex items-center gap-3 text-xs">
                  <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[r.reminder_type] || 'bg-primary'} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{r.title}</div>
                    <div className="text-muted-foreground">{petName(r.pet_id)} · {r.due_date}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    daysUntil <= 1 ? 'bg-destructive/10 text-destructive' :
                    daysUntil <= 7 ? 'bg-warning/10 text-warning' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {daysUntil === 0 ? '今天' : daysUntil === 1 ? '明天' : `${daysUntil}天后`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
