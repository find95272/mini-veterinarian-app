'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stethoscope, HeartPulse, PawPrint, Cat, Dog, Rat, Rabbit, Bird, Fish, Turtle, Utensils, Droplet, Activity, Eye, Wind, Brain, ArrowRight, ArrowLeft, Loader2, AlertTriangle, ClipboardList, RefreshCw, ShieldCheck, Sparkles, Clock, Zap, Star, CheckCircle2, Microscope, ChevronDown, HelpCircle, LogIn, CircleUser as UserCircle, ImagePlus, X, Globe, Moon, Sun, Lock, Bookmark, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from '@/components/AuthModal';
import { LANGS, type Lang, t } from '@/lib/i18n';
import { blogPosts, type BlogPost } from '@/lib/blogPosts';
import { generatePlan as generateLocalPlan } from '@/lib/carePlanGenerator';
import { SPECIES_LIST } from '@/lib/speciesKnowledge';
import { PlanDiagrams, SymptomLocationMap } from '@/components/Diagrams';
import type { SpeciesId } from '@/lib/speciesKnowledge';
import OnboardingTour from '@/components/OnboardingTour';
import { ToastContainer, useToast, type ToastItem } from '@/components/Toast';
import { Bell } from 'lucide-react';

type PetType = 'mouse' | 'cat' | 'dog' | 'rabbit' | 'bird' | 'reptile' | 'fish' | 'ferret';
type SymptomKey = 'eating' | 'excretion' | 'behavior' | 'appearance' | 'respiratory' | 'neuro';

interface PetOption {
  id: PetType;
  labelKey: string;
  descKey: string;
  icon: typeof Rat;
}

const PETS: PetOption[] = [
  { id: 'cat', labelKey: 'petCat', descKey: 'petCatDesc', icon: Cat },
  { id: 'dog', labelKey: 'petDog', descKey: 'petDogDesc', icon: Dog },
  { id: 'rabbit', labelKey: 'petRabbit', descKey: 'petRabbitDesc', icon: Rabbit },
  { id: 'mouse', labelKey: 'petMouse', descKey: 'petMouseDesc', icon: Rat },
  { id: 'bird', labelKey: 'petBird', descKey: 'petBirdDesc', icon: Bird },
  { id: 'reptile', labelKey: 'petReptile', descKey: 'petReptileDesc', icon: Turtle },
  { id: 'fish', labelKey: 'petFish', descKey: 'petFishDesc', icon: Fish },
  { id: 'ferret', labelKey: 'petFerret', descKey: 'petFerretDesc', icon: PawPrint },
];

const SYMPTOMS: { key: SymptomKey; labelKey: string; descKey: string; icon: typeof Utensils }[] = [
  { key: 'eating', labelKey: 'symEating', descKey: 'symEatingDesc', icon: Utensils },
  { key: 'excretion', labelKey: 'symExcretion', descKey: 'symExcretionDesc', icon: Droplet },
  { key: 'behavior', labelKey: 'symBehavior', descKey: 'symBehaviorDesc', icon: Activity },
  { key: 'appearance', labelKey: 'symAppearance', descKey: 'symAppearanceDesc', icon: Eye },
  { key: 'respiratory', labelKey: 'symRespiratory', descKey: 'symRespiratoryDesc', icon: Wind },
  { key: 'neuro', labelKey: 'symNeuro', descKey: 'symNeuroDesc', icon: Brain },
];

type Step = 'landing' | 'welcome' | 'pet' | 'symptom' | 'result';

// --- Minimal markdown renderer (safe, no HTML injection) ---
function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/<\/li>\s*<li>/g, '</li><li>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>(<h\d>|<ul>)/g, '$1').replace(/(<\/h\d>|<\/ul>)<\/p>/g, '$1');
  return html;
}

// --- Floating particle effect ---
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface P {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      a: number;
      tw: number;
      hue: number;
    }
    let particles: P[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.4 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.08,
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
        hue: 170 + Math.random() * 30,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        const twinkle = (Math.sin(p.tw) + 1) / 2;
        const alpha = p.a * (0.4 + twinkle * 0.6);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 70%, 55%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, 70%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>('landing');
  const [petOrder, setPetOrder] = useState<PetType[]>(['cat', 'dog', 'rabbit', 'mouse', 'bird', 'reptile', 'fish', 'ferret']);
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomKey[]>([]);
  const [extra, setExtra] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  const PET_TIPS = [
    'tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6', 'tip7', 'tip8',
    'tip9', 'tip10', 'tip11', 'tip12', 'tip13', 'tip14', 'tip15', 'tip16',
  ];

  useEffect(() => {
    if (!loading) return;
    setTipIndex(Math.floor(Math.random() * PET_TIPS.length));
    setTipVisible(true);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, label, [role="button"], summary')) return;
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % PET_TIPS.length);
        setTipVisible(true);
      }, 300);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [loading]);
  const [error, setError] = useState('');
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [blogShuffle, setBlogShuffle] = useState<BlogPost[]>([]);
  const [lang, setLang] = useState<Lang>('zh');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [generatedRedFlags, setGeneratedRedFlags] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { createToast } = useToast();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, createToast(message, type)]);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mini-vet-lang');
      if (saved === 'zh' || saved === 'en' || saved === 'ja') setLang(saved);
      const dm = localStorage.getItem('mini-vet-dark');
      if (dm === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('mini-vet-dark', String(next)); } catch {}
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const tt = useCallback((k: string) => t(lang, k), [lang]);

  const shuffleBlogPosts = useCallback(() => {
    const shuffled = [...blogPosts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setBlogShuffle(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    shuffleBlogPosts();
  }, [shuffleBlogPosts]);

  // Restore auth session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('display_name,email,avatar_url')
          .eq('id', data.session.user.id)
          .maybeSingle();
        if (p && mounted) {
          setProfileName(p.display_name || p.email);
          setProfileAvatar(p.avatar_url || null);
        }
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      (async () => {
        setSession(s);
        if (s?.user) {
          const { data: p } = await supabase
            .from('profiles')
            .select('display_name,email,avatar_url')
            .eq('id', s.user.id)
            .maybeSingle();
          if (p) {
            setProfileName(p.display_name || p.email);
            setProfileAvatar(p.avatar_url || null);
          } else {
            setProfileName('');
            setProfileAvatar(null);
          }
        } else {
          setProfileName('');
          setProfileAvatar(null);
        }
      })();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const router = useRouter();

  // Persist last session to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mini-vet-session');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.petOrder) setPetOrder(data.petOrder);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mini-vet-session', JSON.stringify({ petOrder }));
    } catch {}
  }, [petOrder]);

  const toggleSymptom = (key: SymptomKey) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const generatePlan = useCallback(async () => {
    if (!selectedPet || selectedSymptoms.length === 0) return;
    setLoading(true);
    setError('');
    setPlan('');
    setStep('result');
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
      const generated = generateLocalPlan({
        petType: selectedPet,
        symptoms: selectedSymptoms,
        extra,
        detailed: !!session,
      });
      const output = generated.detailedPlan || `${generated.summary}\n\n${generated.redFlags.map((flag) => `- ${flag}`).join('\\n')}\\n\\n登录后查看详细护理方案。`;
      setPlan(output);
      if (!output) setError(tt('errNoContent'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tt('errUnknown'));
    } finally {
      setLoading(false);
    }
  }, [selectedPet, selectedSymptoms, extra, session, tt]);

  const restart = () => {
    setStep('welcome');
    setSelectedPet(null);
    setSelectedSymptoms([]);
    setExtra('');
    setImageData(null);
    setPlan('');
    setError('');
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(tt('errImgSize'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const max = 1024;
        let { width, height } = img;
        if (width > max || height > max) {
          const scale = max / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setImageData(src); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setImageData(compressed);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) {
      setDragOverIndex(null);
      return;
    }
    const next = [...petOrder];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    setPetOrder(next);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const petMap = Object.fromEntries(PETS.map((p) => [p.id, p]));

  return (
    <main className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <button
            onClick={() => setStep('landing')}
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="leading-tight text-left hidden xs:block">
              <div className="font-bold text-sm text-foreground">Mini Veterinarian</div>
              <div className="text-[10px] text-muted-foreground">{tt('brandSub')}</div>
            </div>
          </button>

          {step === 'landing' ? (
            <nav className="flex items-center gap-0.5 sm:gap-1 flex-nowrap justify-end min-w-0">
              {[
                { label: tt('navFeatures'), target: 'features' },
                { label: tt('navHow'), target: 'how' },
                { label: tt('navReviews'), target: 'reviews' },
                { label: tt('navFaq'), target: 'faq' },
              ].map((l) => (
                <a
                  key={l.target}
                  href={`#${l.target}`}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors px-1.5 sm:px-2.5 py-1.5 rounded-full hover:bg-primary/5 whitespace-nowrap"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/blog"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors px-1.5 sm:px-2.5 py-1.5 rounded-full hover:bg-primary/5 whitespace-nowrap"
              >
                {tt('navBlog')}
              </a>
              <button
                onClick={toggleDark}
                className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors px-1.5 sm:px-2.5 py-1.5 rounded-full hover:bg-primary/5 whitespace-nowrap"
                  aria-label="Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{LANGS.find((l) => l.code === lang)?.short}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          if (l.code === lang) { setLangOpen(false); return; }
                          try { localStorage.setItem('mini-vet-lang', l.code); } catch {}
                          window.location.reload();
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition-colors ${lang === l.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {session ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="ml-1 inline-flex items-center gap-1.5 text-xs text-foreground bg-secondary/60 px-2.5 py-1.5 rounded-full max-w-[140px] truncate hover:bg-secondary transition-colors whitespace-nowrap"
                  aria-label={tt('navProfile')}
                >
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <UserCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  )}
                  <span className="truncate">{profileName}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="ml-1 inline-flex items-center gap-1 text-xs sm:text-sm text-primary border border-primary/30 px-2 sm:px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tt('navLogin')}</span>
                </button>
              )}
            </nav>
          ) : (
            <div className="flex items-center gap-2 flex-nowrap">
              {session ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="inline-flex items-center gap-1.5 text-xs text-foreground bg-secondary/60 px-2 py-1.5 rounded-full max-w-[120px] truncate hover:bg-secondary transition-colors whitespace-nowrap"
                  aria-label={tt('navProfile')}
                >
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <UserCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  )}
                  <span className="truncate">{profileName}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-primary border border-primary/30 px-2 sm:px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tt('navLogin')}</span>
                </button>
              )}
              <button
                onClick={toggleDark}
                className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-full hover:bg-primary/5 whitespace-nowrap"
                  aria-label="Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{LANGS.find((l) => l.code === lang)?.short}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          if (l.code === lang) { setLangOpen(false); return; }
                          try { localStorage.setItem('mini-vet-lang', l.code); } catch {}
                          window.location.reload();
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition-colors ${lang === l.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {step !== 'welcome' && (
                <button
                  onClick={restart}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tt('navRestart')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => { setAuthOpen(false); showToast('登录成功！已解锁完整功能', 'success'); }} />

      <OnboardingTour onComplete={() => {}} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24">
        {/* Landing / Product intro */}
        {step === 'landing' && (
          <div className="animate-fade-up">
            {/* Hero */}
            <section className="relative text-center pt-6 sm:pt-12 pb-10 overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 to-transparent">
              <Particles />
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[hsl(175,55%,30%)] text-white flex items-center justify-center shadow-lg animate-float-soft">
                    <HeartPulse className="w-10 h-10" />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  {tt('heroBadge')}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-balance text-foreground mb-4 leading-tight">
                  Mini Vet
                  <br />
                  <span className="text-primary">{tt('heroTitle')}</span>
                </h1>
                <p className="text-muted-foreground text-balance max-w-md mb-8 leading-relaxed">
                  {tt('heroDesc')}
                </p>
                <Link
                  href="/diagnose"
                  className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all mb-4"
                >
                  立即体验
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {tt('heroDisclaimer')}
                </p>
              </div>
              {/* Scroll hint for mobile */}
              <div className="sm:hidden flex flex-col items-center gap-1 mt-6 animate-bounce-slow text-muted-foreground/60">
                <span className="text-[10px]">{tt('scrollHint')}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </section>

            {/* Stats bar */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {[
                { value: '8+', label: tt('statPets') },
                { value: '<10s', label: tt('statTime') },
                { value: '$0', label: tt('statFree') },
                { value: '1.2k+', label: tt('statUsers') },
              ].map((s, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border/60 shadow-sm text-center">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </section>

            {/* Features */}
            <section id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 scroll-mt-20">
              {[
                { icon: Zap, title: tt('feat1Title'), desc: tt('feat1Desc') },
                { icon: Microscope, title: tt('feat2Title'), desc: tt('feat2Desc') },
                { icon: ShieldCheck, title: tt('feat3Title'), desc: tt('feat3Desc') },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group bg-card rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <f.icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </section>

            {/* About modules */}
            <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-background p-6 flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-border/40">
                <img
                  src="https://images.pexels.com/photos/38687771/pexels-photo-38687771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Pet cat portrait"
                  className="w-full sm:w-40 h-40 sm:h-40 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {tt('about1Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tt('about1Body')}</p>
                </div>
              </div>
              <div className="bg-background p-6 flex flex-col sm:flex-row-reverse items-center gap-5 rounded-2xl border border-border/40">
                <img
                  src="https://images.pexels.com/photos/20680840/pexels-photo-20680840.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Pet dog portrait"
                  className="w-full sm:w-40 h-40 sm:h-40 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {tt('about2Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tt('about2Body')}</p>
                </div>
              </div>
            </section>

            {/* Pet showcase */}
            <section className="mt-10">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-foreground mb-1">{tt('showcaseTitle')}</h2>
                <p className="text-sm text-muted-foreground">{tt('showcaseDesc')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { img: 'https://images.pexels.com/photos/18418971/pexels-photo-18418971.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', icon: Cat, title: tt('showcaseCat'), desc: tt('showcaseCatDesc') },
                  { img: 'https://images.pexels.com/photos/16299046/pexels-photo-16299046.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', icon: Dog, title: tt('showcaseDog'), desc: tt('showcaseDogDesc') },
                  { img: 'https://images.pexels.com/photos/10884423/pexels-photo-10884423.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', icon: Rat, title: tt('showcaseMouse'), desc: tt('showcaseMouseDesc') },
                ].map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <div key={i} className="group bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="relative h-40 overflow-hidden">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 text-primary flex items-center justify-center shadow-md backdrop-blur-sm">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm text-foreground mb-1">{p.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* How it works */}
            <section id="how" className="mt-10 scroll-mt-20">
              <h2 className="text-center text-lg font-bold text-foreground mb-6">{tt('howTitle')}</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: PawPrint, step: '1', title: tt('how1Title'), desc: tt('how1Desc') },
                  { icon: ClipboardList, step: '2', title: tt('how2Title'), desc: tt('how2Desc') },
                  { icon: Sparkles, step: '3', title: tt('how3Title'), desc: tt('how3Desc') },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border/60 shadow-sm">
                    <div className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md flex-shrink-0">
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <s.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{s.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section id="reviews" className="mt-10 scroll-mt-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { text: tt('t1'), author: tt('t1Author'), avatar: 'https://images.pexels.com/photos/35681211/pexels-photo-35681211.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  { text: tt('t2'), author: tt('t2Author'), avatar: 'https://images.pexels.com/photos/3936894/pexels-photo-3936894.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  { text: tt('t3'), author: tt('t3Author'), avatar: 'https://images.pexels.com/photos/15373305/pexels-photo-15373305.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  { text: tt('t4'), author: tt('t4Author'), avatar: 'https://images.pexels.com/photos/34930167/pexels-photo-34930167.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  { text: tt('t5'), author: tt('t5Author'), avatar: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                  { text: tt('t6'), author: tt('t6Author'), avatar: 'https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' },
                ].map((tm, i) => (
                  <div key={i} className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className="w-3.5 h-3.5 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-3">{tm.text}</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={tm.avatar}
                        alt={tm.author}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <p className="text-xs text-muted-foreground">{tm.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mt-10 scroll-mt-20">
              <h2 className="text-center text-lg font-bold text-foreground mb-6 flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {tt('faqTitle')}
              </h2>
              <div className="space-y-3">
                {[
                  { q: tt('faq1q'), a: tt('faq1a') },
                  { q: tt('faq2q'), a: tt('faq2a') },
                  { q: tt('faq3q'), a: tt('faq3a') },
                  { q: tt('faq4q'), a: tt('faq4a') },
                  { q: tt('faq5q'), a: tt('faq5a') },
                  { q: tt('faq6q'), a: tt('faq6a') },
                ].map((item, i) => (
                  <details key={i} className="group bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none select-none">
                      <span className="text-sm font-semibold text-foreground">{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Blog preview */}
            <section className="mt-10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">{tt('blogPreviewTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{tt('blogPreviewDesc')}</p>
                </div>
                <button
                  onClick={shuffleBlogPosts}
                  className="inline-flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all whitespace-nowrap flex-shrink-0 active:rotate-180"
                >
                  <RefreshCw className="w-3.5 h-3.5 transition-transform" />
                  {tt('blogPreviewMore')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {blogShuffle.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <div className="flex flex-col p-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0 mb-3 group-hover:scale-110 transition-transform">
                        {post.emoji}
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{post.category}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="mt-10 text-center bg-gradient-to-br from-primary to-[hsl(175,55%,30%)] rounded-3xl p-8 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">{tt('ctaTitle')}</h2>
              <p className="text-white/80 text-sm mb-6 max-w-sm mx-auto">{tt('ctaDesc')}</p>
              <Link
                href="/diagnose"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {tt('ctaBtn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <p className="mt-8 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {tt('ctaFooter')}
            </p>
          </div>
        )}

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="relative animate-fade-up flex flex-col items-center text-center pt-8 sm:pt-16 overflow-hidden rounded-3xl">
            <Particles />
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[hsl(175,55%,30%)] text-white flex items-center justify-center shadow-lg animate-float-soft">
                  <HeartPulse className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance text-foreground mb-3">
                {tt('welcomeTitle')}
              </h1>
              <p className="text-muted-foreground text-balance max-w-md mb-8 leading-relaxed">
                {tt('welcomeDesc')}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-sm">
                {[
                  { icon: PawPrint, t: tt('welcomeF1') },
                  { icon: ClipboardList, t: tt('welcomeF2') },
                  { icon: Sparkles, t: tt('welcomeF3') },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="bg-card/80 rounded-2xl p-3 border border-border/60 shadow-sm"
                  >
                    <f.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <div className="text-xs font-semibold text-foreground">{f.t}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('pet')}
                className="group relative z-10 inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
              >
                {tt('welcomeBtn')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setStep('landing')}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {tt('welcomeBack')}
              </button>
              <p className="mt-6 text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {tt('heroDisclaimer')}
              </p>
            </div>
          </div>
        )}

        {/* Pet selection with drag-to-reorder */}
        {step === 'pet' && (
          <section className="animate-fade-up">
            <StepHeader
              num={1}
              title={tt('petTitle')}
              hint={tt('petHint')}
            />
            <div className="space-y-3">
              {petOrder.map((id, index) => {
                const pet = petMap[id];
                const speciesInfo = SPECIES_LIST.find((species) => species.id === (id === 'mouse' ? 'rodent' : id));
                const Icon = pet.icon;
                const active = selectedPet === id;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDragOverIndex(null)}
                    onClick={() => setSelectedPet(id)}
                    className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      active
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    } ${dragOverIndex === index ? 'ring-2 ring-primary/40 -translate-y-0.5' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-0.5 text-muted-foreground/60 cursor-grab active:cursor-grabbing touch-none">
                      <span className="text-xs">⋮⋮</span>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        active ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-foreground">{tt(pet.labelKey)}</div>
                      <div className="text-xs text-muted-foreground">{tt(pet.descKey)}</div>
                      {speciesInfo && <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary ${speciesInfo.careDifficulty === 'easy' ? 'text-success' : speciesInfo.careDifficulty === 'medium' ? 'text-primary' : speciesInfo.careDifficulty === 'hard' ? 'text-warning' : 'text-destructive'}`}>{speciesInfo.careDifficultyLabel}护理</span>}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        active ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    >
                      {active && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <NavButtons
              onBack={() => setStep('welcome')}
              onNext={() => selectedPet && setStep('symptom')}
              nextDisabled={!selectedPet}
              lang={lang}
            />
          </section>
        )}

        {/* Symptom selection */}
        {step === 'symptom' && (
          <section className="animate-fade-up">
            <StepHeader num={2} title={tt('symptomTitle')} />
            <div className="grid grid-cols-2 gap-3">
              {SYMPTOMS.map((s) => {
                const Icon = s.icon;
                const active = selectedSymptoms.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleSymptom(s.key)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      active
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          active ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-1">{tt(s.labelKey)}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{tt(s.descKey)}</div>
                  </button>
                );
              })}
            </div>

            {session && selectedPet && (
              <div className="mt-4">
                <SymptomLocationMap
                  species={(selectedPet === 'mouse' ? 'rodent' : selectedPet) as SpeciesId}
                  onAreaClick={(key) => {
                    const symKey = key as SymptomKey;
                    setSelectedSymptoms((prev) =>
                      prev.includes(symKey) ? prev.filter((s) => s !== symKey) : [...prev, symKey]
                    );
                  }}
                  selectedAreas={selectedSymptoms}
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                {tt('extraLabel')} <span className="text-muted-foreground font-normal">{tt('extraOptional')}</span>
              </label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder={tt('extraPlaceholder')}
                className="w-full rounded-2xl border border-input bg-card p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[88px]"
                maxLength={300}
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">{extra.length}/300</div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                {tt('uploadLabel')} <span className="text-muted-foreground font-normal">{tt('uploadHint')}</span>
              </label>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                onChange={handleImgChange}
                className="hidden"
              />
              {imageData ? (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
                  <img src={imageData} alt={tt('photoAlt')} className="w-full max-h-64 object-cover" />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label={tt('removePhoto')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => imgInputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all p-6 flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{tt('uploadClick')}</span>
                  <span className="text-[11px]">{tt('uploadFormat')}</span>
                </button>
              )}
            </div>

            <NavButtons
              onBack={() => setStep('pet')}
              onNext={generatePlan}
              nextDisabled={selectedSymptoms.length === 0 || loading}
              nextLabel={loading ? tt('generating') : tt('generateBtn')}
              lang={lang}
            />
          </section>
        )}

        {/* Result */}
        {step === 'result' && (
          <section className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">{tt('resultTitle')}</h2>
                <p className="text-xs text-muted-foreground">
                  {petMap[selectedPet ?? 'cat'] ? tt(petMap[selectedPet ?? 'cat']?.labelKey) : ''} ·{' '}
                  {selectedSymptoms
                    .map((s) => tt(SYMPTOMS.find((x) => x.key === s)?.labelKey ?? ''))
                    .join('、')}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <pre className="text-xs whitespace-pre-wrap break-all font-mono leading-relaxed">{error}</pre>
              </div>
            )}

            {loading && !plan && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="walk-scene">
                  <div className={`walk-pet pet-${selectedPet}`}>
                    <div className="pet-tail" />
                    <div className="pet-body" />
                    <div className="pet-head">
                      <div className="pet-ear left" />
                      <div className="pet-ear right" />
                      <div className="pet-eye left" />
                      <div className="pet-eye right" />
                      <div className="pet-nose" />
                    </div>
                    <div className="pet-leg l1" />
                    <div className="pet-leg l2" />
                    <div className="pet-leg l3" />
                    <div className="pet-leg l4" />
                  </div>
                  <div className="walk-ground" />
                  <div className="walk-grass" style={{ left: '20px' }} />
                  <div className="walk-grass" style={{ left: '60px', animationDelay: '0.3s' }} />
                  <div className="walk-grass" style={{ left: '120px', animationDelay: '0.6s' }} />
                  <div className="walk-grass" style={{ left: '160px', animationDelay: '0.9s' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-3 h-4 transition-opacity duration-300" style={{ opacity: tipVisible ? 1 : 0 }}>
                  💡 {tt(PET_TIPS[tipIndex])}
                </p>
              </div>
            )}

            {plan && (
              <>
                <div
                  className="prose-vet bg-card rounded-2xl border border-border p-5 shadow-sm text-sm text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }}
                />
                {!session && (
                  <div className="mt-3 premium-banner rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">登录后查看带图解的详细精准方案</p>
                      <p className="text-xs text-muted-foreground mt-0.5">含物种解剖图、护理步骤图解、用药剂量参考、就医决策流程图</p>
                    </div>
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="inline-flex items-center gap-1 text-xs text-primary-foreground bg-primary px-3 py-2 rounded-full font-medium whitespace-nowrap flex-shrink-0"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      登录
                    </button>
                  </div>
                )}
                {session && (
                  <div className="mt-3">
                    <PlanDiagrams
                      species={(selectedPet === 'mouse' ? 'rodent' : selectedPet ?? 'cat') as SpeciesId}
                      redFlags={generatedRedFlags}
                    />
                  </div>
                )}
                {session && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={async () => {
                        if (!session) return;
                        await supabase.from('care_plans').insert({
                          user_id: session.user.id,
                          species: selectedPet,
                          symptoms: selectedSymptoms,
                          plan_text: plan,
                        });
                        setPlanSaved(true);
                        showToast('方案已保存', 'success');
                        setTimeout(() => setPlanSaved(false), 2000);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      {planSaved ? '已保存' : '保存方案'}
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'Mini Vet 护理方案', text: plan }).catch(() => {});
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {loading && plan && (
              <div className="flex items-center gap-2 text-primary text-sm mt-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                {tt('regenerating')}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={generatePlan}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                {tt('regenBtn')}
              </button>
              <button
                onClick={restart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                {tt('newConsult')}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepHeader({ num, title, hint }: { num: number; title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {num}
        </span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {hint && <p className="text-xs text-muted-foreground pl-8">{hint}</p>}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  lang = 'zh',
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  lang?: Lang;
}) {
  return (
    <div className="flex gap-3 mt-7">
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t(lang, 'backBtn')}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
      >
        {nextLabel ?? t(lang, 'nextBtn')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
