'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';
import {
  User, LogOut, LogIn, ArrowLeft, Loader2, CheckCircle2, Pencil,
  Plus, Trash2, X, Camera, PawPrint, Calendar, Bookmark, Bell,
  TrendingUp, Trophy, Settings, Moon, Sun, Flame, Award, Heart,
  Activity, Clock, Stethoscope, Search, ChevronDown, Download, Share2,
  Star, Target, Zap, Syringe, Pill, Stethoscope as StethoIcon,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import {
  SPECIES_CATEGORIES, speciesIcon, breedsForSpecies,
} from '@/lib/petBreeds';
import { PlanDiagrams } from '@/components/Diagrams';
import ShareableCard from '@/components/ShareableCard';
import ReminderCalendar from '@/components/ReminderCalendar';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import Confetti from '@/components/Confetti';
import { ToastContainer, useToast, type ToastItem } from '@/components/Toast';

type Tab = 'pets' | 'timeline' | 'plans' | 'reminders' | 'stats' | 'badges' | 'settings';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  age: string | null;
  weight: number | null;
  birthday: string | null;
  microchip_id: string | null;
  neuter_status: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  photo_url: string | null;
  health_score: number | null;
}

interface HealthEvent {
  id: string;
  pet_id: string;
  event_type: string;
  title: string;
  description: string | null;
  severity: string;
  event_date: string;
}

interface CarePlan {
  id: string;
  species: string;
  symptoms: string[];
  plan_text: string;
  created_at: string;
}

interface Reminder {
  id: string;
  pet_id: string;
  reminder_type: string;
  title: string;
  due_date: string;
  completed: boolean;
}

interface WeightRecord {
  id: string;
  weight: number;
  recorded_at: string;
}

interface CheckIn {
  check_in_date: string;
  streak_count: number;
}

interface Achievement {
  badge_id: string;
  earned_at: string;
}

const GENDER_OPTIONS = ['公', '母', '未知'];
const NEUTER_OPTIONS = ['未绝育', '已绝育', '未知'];

const BADGES = [
  { id: 'new_owner', name: '新手铲屎官', desc: '注册账号', icon: '🐾' },
  { id: 'first_pet', name: '第一只宠物', desc: '添加第一只宠物档案', icon: '🐱' },
  { id: 'health_guardian', name: '健康守护者', desc: '完成 3 次护理方案', icon: '🛡️' },
  { id: 'checkin_7', name: '坚持打卡', desc: '连续签到 7 天', icon: '🔥' },
  { id: 'checkin_30', name: '习惯养成', desc: '连续签到 30 天', icon: '⭐' },
  { id: 'science_fan', name: '科普达人', desc: '阅读 5 篇护理文章', icon: '📚' },
  { id: 'multi_pet', name: '多宠家庭', desc: '添加 3 只以上宠物', icon: '🏡' },
  { id: 'plan_saver', name: '方案收藏家', desc: '保存 5 份护理方案', icon: '💾' },
];

const TABS: { id: Tab; label: string; icon: typeof PawPrint }[] = [
  { id: 'pets', label: '宠物档案', icon: PawPrint },
  { id: 'timeline', label: '健康时间轴', icon: Activity },
  { id: 'plans', label: '我的方案', icon: Bookmark },
  { id: 'reminders', label: '智能提醒', icon: Bell },
  { id: 'stats', label: '数据统计', icon: TrendingUp },
  { id: 'badges', label: '成就', icon: Trophy },
  { id: 'settings', label: '设置', icon: Settings },
];

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pets');
  const [darkMode, setDarkMode] = useState(false);

  const [pets, setPets] = useState<Pet[]>([]);
  const [showPetForm, setShowPetForm] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '', species: '猫', breed: '', gender: '未知', age: '',
    weight: '', birthday: '', microchip_id: '', neuter_status: '未知',
    allergies: '', chronic_conditions: '',
  });
  const [breedQuery, setBreedQuery] = useState('');
  const [petSaving, setPetSaving] = useState(false);
  const [petError, setPetError] = useState('');
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [expandedPet, setExpandedPet] = useState<string | null>(null);

  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);
  const [checkInToday, setCheckInToday] = useState(false);

  const [planSearch, setPlanSearch] = useState('');
  const [showMilestoneCard, setShowMilestoneCard] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [notifPrefs, setNotifPrefs] = useState({ vaccine: true, deworming: true, checkup: true, medication: true });
  const [toast, setToast] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { createToast } = useToast();
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => setToasts((prev) => [...prev, createToast(message, type)]);
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [prevBadgeCount, setPrevBadgeCount] = useState(0);

  const loadPets = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (data) setPets(data as Pet[]);
  }, []);

  const loadHealthData = useCallback(async (userId: string) => {
    const petIds = pets.map((p) => p.id);
    if (petIds.length === 0) return;

    const [events, plans, rems, weights] = await Promise.all([
      supabase.from('health_events').select('*').in('pet_id', petIds).order('event_date', { ascending: false }),
      supabase.from('care_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').in('pet_id', petIds).order('due_date', { ascending: true }),
      supabase.from('weight_records').select('*').in('pet_id', petIds).order('recorded_at', { ascending: true }),
    ]);

    if (events.data) setHealthEvents(events.data as HealthEvent[]);
    if (plans.data) setCarePlans(plans.data as CarePlan[]);
    if (rems.data) setReminders(rems.data as Reminder[]);
    if (weights.data) setWeightRecords(weights.data as WeightRecord[]);
  }, [pets]);

  const loadGamification = useCallback(async (userId: string) => {
    const [checks, achs] = await Promise.all([
      supabase.from('check_ins').select('*').eq('user_id', userId).order('check_in_date', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', userId),
    ]);
    if (checks.data) {
      setCheckIns(checks.data as CheckIn[]);
      const latest = checks.data[0] as CheckIn | undefined;
      if (latest) setStreak(latest.streak_count);
      const today = new Date().toISOString().split('T')[0];
      setCheckInToday(!!checks.data.find((c: unknown) => (c as CheckIn).check_in_date === today));
    }
    if (achs.data) setAchievements(achs.data as Achievement[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        setLoading(false);
        return;
      }
      setSession(data.session);
      setEmail(data.session.user.email ?? '');
      setCreatedAt(data.session.user.created_at ?? '');
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (p && mounted) {
        setDisplayName(p.display_name || p.email || '');
        setAvatarUrl(p.avatar_url || null);
        setBio(p.bio || '');
        setCity(p.city || '');
        setLevel(p.level || 1);
        setXp(p.xp || 0);
        if (p.notification_preferences) setNotifPrefs({ ...notifPrefs, ...p.notification_preferences });
        if (p.theme === 'dark') {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        }
      }
      await loadPets(data.session.user.id);
      await loadGamification(data.session.user.id);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) {
        setSession(null);
        setPets([]);
        setCarePlans([]);
        setHealthEvents([]);
        setReminders([]);
        setAchievements([]);
        setCheckIns([]);
        setStreak(0);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, loadPets, loadGamification]);

  useEffect(() => {
    if (session && pets.length > 0) {
      loadHealthData(session.user.id);
    }
  }, [session, pets, loadHealthData]);

  useEffect(() => {
    if (achievements.length > prevBadgeCount && prevBadgeCount > 0) {
      setConfettiTrigger((t) => t + 1);
      showToast(`恭喜解锁新徽章！`, 'success');
    }
    setPrevBadgeCount(achievements.length);
  }, [achievements.length]);

  useEffect(() => {
    if (!session) return;
    const checkDueReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const due = reminders.find((r) => !r.completed && r.due_date <= today);
      if (due) {
        setToast(`提醒：${due.title} 已到期！`);
        setTimeout(() => setToast(null), 5000);
      }
    };
    checkDueReminders();
    const interval = setInterval(checkDueReminders, 60000);
    return () => clearInterval(interval);
  }, [session, reminders]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPets([]);
    setCarePlans([]);
    setHealthEvents([]);
    setReminders([]);
    setAchievements([]);
    setCheckIns([]);
    setStreak(0);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${session.user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const url = pub.publicUrl;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', session.user.id);
      setAvatarUrl(url);
    } catch {
      alert('头像上传失败，请重试。');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveName = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: editValue.trim() || null })
      .eq('id', session.user.id);
    setSaving(false);
    if (!error) {
      setDisplayName(editValue.trim() || email);
      setEditing(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
  };

  const resetPetForm = () => {
    setPetForm({
      name: '', species: '猫', breed: '', gender: '未知', age: '',
      weight: '', birthday: '', microchip_id: '', neuter_status: '未知',
      allergies: '', chronic_conditions: '',
    });
    setBreedQuery('');
    setPetError('');
    setEditingPetId(null);
  };

  const openAddPet = () => {
    resetPetForm();
    setShowPetForm(true);
  };

  const openEditPet = (pet: Pet) => {
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender || '未知',
      age: pet.age || '',
      weight: pet.weight?.toString() || '',
      birthday: pet.birthday || '',
      microchip_id: pet.microchip_id || '',
      neuter_status: pet.neuter_status || '未知',
      allergies: pet.allergies || '',
      chronic_conditions: pet.chronic_conditions || '',
    });
    setBreedQuery('');
    setEditingPetId(pet.id);
    setPetError('');
    setShowPetForm(true);
  };

  const savePet = async () => {
    if (!session) return;
    if (!petForm.name.trim()) {
      setPetError('请填写宠物名字。');
      return;
    }
    setPetSaving(true);
    setPetError('');
    try {
      const payload = {
        name: petForm.name.trim(),
        species: petForm.species,
        breed: petForm.breed.trim() || null,
        gender: petForm.gender,
        age: petForm.age.trim() || null,
        weight: petForm.weight ? parseFloat(petForm.weight) : null,
        birthday: petForm.birthday || null,
        microchip_id: petForm.microchip_id.trim() || null,
        neuter_status: petForm.neuter_status,
        allergies: petForm.allergies.trim() || null,
        chronic_conditions: petForm.chronic_conditions.trim() || null,
      };
      if (editingPetId) {
        const { error } = await supabase.from('pets').update(payload).eq('id', editingPetId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pets').insert({ ...payload, user_id: session.user.id });
        if (error) throw error;
      }
      await loadPets(session.user.id);
      setShowPetForm(false);
      resetPetForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存失败，请重试。';
      setPetError(msg);
    } finally {
      setPetSaving(false);
    }
  };

  const deletePet = async (petId: string) => {
    if (!session) return;
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (!error) {
      setPets((prev) => prev.filter((p) => p.id !== petId));
    }
  };

  const doCheckIn = async () => {
    if (!session || checkInToday) return;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = checkIns[0]?.check_in_date === yesterday ? streak + 1 : 1;

    const { error } = await supabase.from('check_ins').insert({
      user_id: session.user.id,
      check_in_date: today,
      streak_count: newStreak,
    });
    if (!error) {
      setStreak(newStreak);
      setCheckInToday(true);
      setCheckIns([{ check_in_date: today, streak_count: newStreak }, ...checkIns]);
      await supabase.from('profiles').update({ xp: xp + 10 }).eq('id', session.user.id);
      setXp(xp + 10);
    }
  };

  const toggleReminder = async (id: string, completed: boolean) => {
    await supabase
      .from('reminders')
      .update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null })
      .eq('id', id);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !completed } : r)));
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (session) {
      supabase.from('profiles').update({ theme: next ? 'dark' : 'light' }).eq('id', session.user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const initial = (displayName || email)[0]?.toUpperCase() ?? '?';
  const filteredPlans = carePlans.filter((p) =>
    !planSearch || p.species?.includes(planSearch) || p.plan_text?.includes(planSearch)
  );

  const petName = (petId: string) => pets.find((p) => p.id === petId)?.name ?? '未知宠物';

  return (
    <main className="min-h-screen bg-background">
      <Confetti trigger={confettiTrigger} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {toast && <div className="fixed top-20 right-4 z-50 max-w-xs rounded-xl bg-foreground text-background px-4 py-3 text-sm shadow-xl animate-toast-in">{toast}</div>}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-card/80 border-b border-border/60">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </button>
          <span className="text-sm font-semibold text-foreground">个人主页</span>
          <div className="flex items-center gap-2">
            <NotificationBell reminders={reminders} petCount={pets.length} streak={streak} />
            {session ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">退出</span>
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登录</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        {!session && (
          <div className="mb-4 premium-banner rounded-2xl p-4 flex items-center gap-3 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">登录后解锁完整功能</p>
              <p className="text-xs text-muted-foreground mt-0.5">登录后可保存宠物档案、护理方案，设置提醒并查看统计数据</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-primary-foreground bg-primary px-3 py-2 rounded-full font-medium whitespace-nowrap flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              去登录
            </Link>
          </div>
        )}

        {/* Profile header */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 sm:p-8 mb-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-[hsl(175,55%,30%)] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
                ) : initial}
              </div>
              <button
                onClick={() => session && fileInputRef.current?.click()}
                disabled={avatarUploading || !session}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card hover:scale-110 transition-transform disabled:opacity-60"
                aria-label="更换头像"
              >
                {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    maxLength={20}
                    autoFocus
                    placeholder="输入昵称"
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button onClick={saveName} disabled={saving} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { if (session) { setEditValue(displayName); setEditing(true); } }}
                  disabled={!session}
                  className="inline-flex items-center gap-1.5 text-lg font-bold text-foreground hover:text-primary transition-colors disabled:cursor-default"
                >
                  {displayName || (session ? '点击设置昵称' : '未登录用户')}
                  {session && <Pencil className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              )}
              {savedFlash && <span className="text-xs text-success ml-2">已保存</span>}
              <div className="text-xs text-muted-foreground mt-1">{email}</div>
              {bio && <div className="text-sm text-foreground/80 mt-2">{bio}</div>}
              {city && <div className="text-xs text-muted-foreground mt-1">📍 {city}</div>}
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  <Award className="w-3 h-3" />
                  Lv.{level}
                </span>
                <span className="text-xs text-muted-foreground">{xp} XP</span>
                {createdAt && (
                  <span className="text-xs text-muted-foreground">
                    加入于 {new Date(createdAt).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>

            {/* Daily check-in */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={doCheckIn}
                disabled={checkInToday || !session}
                className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  checkInToday
                    ? 'bg-accent/20 text-accent'
                    : 'bg-gradient-to-br from-primary to-[hsl(175,55%,30%)] text-primary-foreground hover:scale-105 shadow-lg'
                }`}
              >
                {streak > 0 && !checkInToday && (
                  <Flame className="absolute -top-2 -right-2 w-5 h-5 text-accent animate-flame" />
                )}
                <span className="text-lg font-bold">{streak}</span>
                <span className="text-[9px]">连续打卡</span>
              </button>
              <span className="text-[10px] text-muted-foreground">
                {checkInToday ? '今日已打卡' : '点击打卡'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto styled-scroll border-b border-border mb-4 pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fade-up">
          {/* PETS TAB */}
          {activeTab === 'pets' && (
            <div className="space-y-3">
              <button
                onClick={session ? openAddPet : undefined}
                disabled={!session}
                className="w-full flex items-center justify-center gap-2 bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-4 text-primary hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加宠物</span>
              </button>

              {pets.map((pet) => {
                const Icon = speciesIcon(pet.species);
                const isExpanded = expandedPet === pet.id;
                return (
                  <div key={pet.id} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedPet(isExpanded ? null : pet.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        {pet.photo_url ? (
                          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-foreground">{pet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pet.species} · {pet.breed || '未知品种'} · {pet.gender}
                          {pet.age && ` · ${pet.age}`}
                        </div>
                      </div>
                      {pet.health_score != null && (
                        <div className="flex items-center gap-1 text-xs">
                          <Heart className="w-3 h-3 text-primary" />
                          <span className="font-medium text-foreground">{pet.health_score}</span>
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/40 pt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {pet.weight && <div><span className="text-muted-foreground">体重：</span><span className="text-foreground">{pet.weight}kg</span></div>}
                          {pet.birthday && <div><span className="text-muted-foreground">生日：</span><span className="text-foreground">{pet.birthday}</span></div>}
                          {pet.neuter_status && <div><span className="text-muted-foreground">绝育：</span><span className="text-foreground">{pet.neuter_status}</span></div>}
                          {pet.microchip_id && <div><span className="text-muted-foreground">芯片：</span><span className="text-foreground">{pet.microchip_id}</span></div>}
                          {pet.allergies && <div className="col-span-2"><span className="text-muted-foreground">过敏：</span><span className="text-destructive">{pet.allergies}</span></div>}
                          {pet.chronic_conditions && <div className="col-span-2"><span className="text-muted-foreground">慢性病：</span><span className="text-foreground">{pet.chronic_conditions}</span></div>}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => openEditPet(pet)} className="flex-1 text-xs bg-secondary text-secondary-foreground py-2 rounded-lg hover:bg-secondary/70 transition-colors">
                            编辑
                          </button>
                          <button onClick={() => setConfirmDelete(pet.id)} className="text-xs text-destructive border border-destructive/30 px-3 py-2 rounded-lg hover:bg-destructive/5 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {pets.length === 0 && !showPetForm && (
                <EmptyState
                  icon="pet"
                  title={session ? "还没有宠物，先添加一个吧" : "登录后添加宠物档案"}
                  desc="添加宠物档案后，可获得更精准的护理方案和个性化提醒"
                  action={session ? <button onClick={openAddPet} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" />添加第一只宠物</button> : <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"><LogIn className="w-4 h-4" />去登录</Link>}
                />
              )}

              {showPetForm && (
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{editingPetId ? '编辑宠物' : '添加宠物'}</h3>
                    <button onClick={() => { setShowPetForm(false); resetPetForm(); }} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">名字 *</label>
                      <input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="宠物名字" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">物种</label>
                      <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value, breed: '' })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                        {SPECIES_CATEGORIES.map((s) => <option key={s.value} value={s.value}>{s.value}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">品种</label>
                      <input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} list="breeds-list" placeholder="选择或输入品种" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      <datalist id="breeds-list">
                        {breedsForSpecies(petForm.species).map((b) => <option key={b} value={b} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">性别</label>
                      <select value={petForm.gender} onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">年龄</label>
                      <input value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="如：2岁3月" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">体重(kg)</label>
                      <input type="number" step="0.1" value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="如：4.5" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">生日</label>
                      <input type="date" value={petForm.birthday} onChange={(e) => setPetForm({ ...petForm, birthday: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">绝育状态</label>
                      <select value={petForm.neuter_status} onChange={(e) => setPetForm({ ...petForm, neuter_status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                        {NEUTER_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">芯片号</label>
                      <input value={petForm.microchip_id} onChange={(e) => setPetForm({ ...petForm, microchip_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="微芯片编号" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">过敏史</label>
                      <input value={petForm.allergies} onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="如：鸡肉" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">慢性疾病</label>
                      <input value={petForm.chronic_conditions} onChange={(e) => setPetForm({ ...petForm, chronic_conditions: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="如：慢性肾衰" />
                    </div>
                  </div>
                  {petError && <p className="text-xs text-destructive">{petError}</p>}
                  <button onClick={savePet} disabled={petSaving} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    {petSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {editingPetId ? '保存修改' : '添加宠物'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto styled-scroll pb-1">
                {['all', 'visit', 'symptom', 'plan', 'medication'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTimelineFilter(type)}
                    className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                      timelineFilter === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {type === 'all' ? '全部' : type === 'visit' ? '就诊' : type === 'symptom' ? '症状' : type === 'plan' ? '方案' : '用药'}
                  </button>
                ))}
              </div>
              {healthEvents.length === 0 ? (
                <EmptyState icon="timeline" title="暂无健康记录" desc="生成护理方案后会自动记录到这里" />
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  {healthEvents
                    .filter((e) => timelineFilter === 'all' || e.event_type === timelineFilter)
                    .map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative mb-3"
                    >
                      <div className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 border-card ${
                        event.severity === 'urgent' ? 'bg-destructive' :
                        event.severity === 'warning' ? 'bg-warning' : 'bg-primary'
                      }`} />
                      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4 flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          event.severity === 'urgent' ? 'bg-destructive/10 text-destructive' :
                          event.severity === 'warning' ? 'bg-warning/10 text-warning' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {event.event_type === 'visit' ? <Stethoscope className="w-5 h-5" /> :
                           event.event_type === 'medication' ? <Activity className="w-5 h-5" /> :
                           <Heart className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{event.title}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {event.event_date}
                            </span>
                          </div>
                          {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{petName(event.pet_id)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="space-y-3">
              {carePlans.length === 0 ? (
                <EmptyState icon="plan" title="暂无保存的方案" desc="在首页生成方案后可保存到此处" />
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={planSearch}
                      onChange={(e) => setPlanSearch(e.target.value)}
                      placeholder="搜索方案..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  {filteredPlans.map((plan) => (
                    <details key={plan.id} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden group">
                      <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{plan.species || '未知物种'}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(plan.created_at).toLocaleDateString('zh-CN')} · {plan.symptoms?.join('、') || ''}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-4 pb-4 text-xs text-foreground/80 whitespace-pre-wrap border-t border-border/40 pt-3">
                        {plan.plan_text}
                      </div>
                    </details>
                  ))}
                </>
              )}
            </div>
          )}

          {/* REMINDERS TAB */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {reminders.length === 0 ? (
                <EmptyState icon="reminder" title="暂无提醒" desc="添加宠物档案后可设置疫苗、驱虫、体检提醒" />
              ) : (
                <>
                  <ReminderCalendar reminders={reminders} petName={petName} />
                  <div className="space-y-2">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className={`bg-card rounded-2xl border border-border/60 shadow-sm p-4 flex items-center gap-3 ${reminder.completed ? 'opacity-60' : ''}`}>
                        <button
                          onClick={() => toggleReminder(reminder.id, reminder.completed)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            reminder.completed ? 'bg-success border-success' : 'border-border hover:border-primary'
                          }`}
                        >
                          {reminder.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${reminder.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{reminder.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />{reminder.due_date}<span>·</span>{petName(reminder.pet_id)}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {reminder.reminder_type === 'vaccine' ? '疫苗' : reminder.reminder_type === 'deworming' ? '驱虫' : reminder.reminder_type === 'checkup' ? '体检' : '用药'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (() => {
            const weightData = weightRecords.slice(-12).map((w) => ({ date: w.recorded_at.slice(5), weight: w.weight }));
            const symptomCounts = healthEvents.reduce<Record<string, number>>((acc, e) => {
              acc[e.title] = (acc[e.title] || 0) + 1;
              return acc;
            }, {});
            const symptomData = Object.entries(symptomCounts).slice(0, 6).map(([name, count]) => ({ name: name.slice(0, 8), count }));
            const activityData = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              const key = d.toISOString().slice(0, 10);
              return { date: key.slice(5), count: healthEvents.filter((e) => e.event_date.slice(0, 10) === key).length + checkIns.filter((c) => c.check_in_date === key).length };
            });
            const healthScore = Math.min(100, Math.round(60 + pets.length * 8 + Math.min(streak, 20) + (reminders.filter((r) => r.completed).length * 2)));
            const scoreData = [{ name: '健康评分', value: healthScore, fill: 'hsl(175 60% 38%)' }];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[['宠物数量', pets.length], ['保存方案', carePlans.length], ['健康记录', healthEvents.length], ['连续打卡', `${streak} 天`]].map(([label, value]) => (
                    <div key={String(label)} className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                      <div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold text-primary mt-1">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">健康评分</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadialBarChart innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={scoreData}>
                        <RadialBar background dataKey="value" cornerRadius={8} />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">{healthScore}</text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">护理活跃度</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={activityData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="count" fill="hsl(175 60% 38%)" radius={[4, 4, 0, 0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {weightData.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">体重趋势</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={weightData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="weight" stroke="hsl(175 60% 38%)" strokeWidth={3} dot={{ r: 4 }} /></LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {symptomData.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">症状频次</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={symptomData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} /><YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="count" fill="hsl(35 80% 58%)" radius={[0, 4, 4, 0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <PlanDiagrams species="cat" />
              </div>
            );
          })()}

          {/* BADGES TAB */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-border/60 p-4 text-center">
                <div className="text-xs text-muted-foreground">已获得徽章</div>
                <div className="text-3xl font-bold text-primary mt-1">{achievements.length} / {BADGES.length}</div>
                <div className="w-full max-w-xs mx-auto h-2 bg-secondary rounded-full mt-3 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }} /></div>
                <div className="text-[10px] text-muted-foreground mt-1">距离下一级还需 {1000 - (xp % 1000)} XP</div>
              </div>
              <button onClick={() => setShowMilestoneCard(!showMilestoneCard)} className="w-full flex items-center justify-center gap-2 bg-primary/5 border border-primary/30 rounded-2xl p-3 text-sm text-primary font-medium hover:bg-primary/10 transition-colors"><Share2 className="w-4 h-4" />{showMilestoneCard ? '隐藏分享卡片' : '生成我的分享卡片'}</button>
              {showMilestoneCard && <ShareableCard displayName={displayName} level={level} xp={xp} streak={streak} petCount={pets.length} badgeCount={achievements.length} avatarUrl={avatarUrl} />}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BADGES.map((badge) => {
                  const earned = achievements.find((a) => a.badge_id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`bg-card rounded-2xl border p-4 text-center transition-all ${
                        earned ? 'border-primary/40 shadow-sm' : 'border-border/40 opacity-50'
                      }`}
                    >
                      <div className={`text-3xl mb-2 ${earned ? 'animate-badge-pop' : 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <div className="text-xs font-medium text-foreground">{badge.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</div>
                      {earned && (
                        <div className="text-[10px] text-success mt-1">
                          {new Date(earned.earned_at).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">个人资料</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">个人简介</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      onBlur={async () => {
                        if (session) await supabase.from('profiles').update({ bio }).eq('id', session.user.id);
                      }}
                      placeholder="介绍一下自己和你的宠物..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">所在城市</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={async () => {
                        if (session) await supabase.from('profiles').update({ city }).eq('id', session.user.id);
                      }}
                      placeholder="如：北京"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">外观</h4>
                <button onClick={toggleDark} className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <span className="text-sm text-foreground flex items-center gap-2">{darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}深色模式</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-border'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} /></div>
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">提醒偏好</h4>
                <div className="space-y-2">
                  {Object.entries({ vaccine: '疫苗提醒', deworming: '驱虫提醒', checkup: '体检提醒', medication: '用药提醒' }).map(([key, label]) => {
                    const enabled = notifPrefs[key as keyof typeof notifPrefs];
                    return <button key={key} onClick={() => { const next = { ...notifPrefs, [key]: !enabled }; setNotifPrefs(next); if (session) supabase.from('profiles').update({ notification_preferences: next }).eq('id', session.user.id); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"><span className="text-sm text-foreground flex items-center gap-2"><Bell className="w-4 h-4" />{label}</span><div className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} /></div></button>;
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">到期提醒会在页面打开时显示提示。</p>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">账号管理</h4>
                <button
                  onClick={async () => {
                    if (!email) return;
                    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/' });
                    setToast(error ? '发送失败，请稍后重试。' : '密码重置邮件已发送，请检查邮箱。');
                    setTimeout(() => setToast(null), 4000);
                  }}
                  className="w-full text-sm bg-secondary text-secondary-foreground py-2.5 rounded-xl hover:bg-secondary/70 transition-colors"
                >
                  发送密码重置邮件
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">数据</h4>
                <button
                  onClick={() => {
                    const data = { pets, carePlans, healthEvents, checkIns };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mini-vet-data.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full text-sm bg-secondary text-secondary-foreground py-2.5 rounded-xl hover:bg-secondary/70 transition-colors"
                >
                  导出我的数据
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-sm text-destructive border border-destructive/30 py-2.5 rounded-xl hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete !== null}
        title="删除宠物档案"
        message="确定要删除这个宠物档案吗？相关的健康记录和提醒也会被删除，此操作不可撤销。"
        confirmLabel="确认删除"
        cancelLabel="取消"
        destructive
        onConfirm={() => { if (confirmDelete) { deletePet(confirmDelete); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </main>
  );
}
