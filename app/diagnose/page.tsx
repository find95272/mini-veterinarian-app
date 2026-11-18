'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Stethoscope, ArrowLeft, ArrowRight, Loader2, AlertTriangle,
  ClipboardList, RefreshCw, ShieldCheck, ImagePlus, X,
  Utensils, Droplet, Activity, Eye, Wind, Brain,
  Cat, Dog, Rabbit, Rat, Bird, Fish, Turtle, PawPrint,
} from 'lucide-react';
import { generatePlan } from '@/lib/carePlanGenerator';
import { SPECIES_LIST, SYMPTOM_CATEGORIES, type SpeciesId, type SymptomCategoryId } from '@/lib/speciesKnowledge';

const SPECIES_ICONS: Record<SpeciesId, typeof Cat> = {
  cat: Cat, dog: Dog, rabbit: Rabbit, rodent: Rat,
  bird: Bird, reptile: Turtle, fish: Fish, ferret: PawPrint,
};

const CATEGORY_ICONS: Record<SymptomCategoryId, typeof Utensils> = {
  eating: Utensils, excretion: Droplet, behavior: Activity,
  appearance: Eye, respiratory: Wind, neuro: Brain,
};

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

type Step = 'species' | 'symptoms' | 'result';

export default function DiagnosePage() {
  const [step, setStep] = useState<Step>('species');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesId | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomCategoryId[]>([]);
  const [extra, setExtra] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const toggleSymptom = (key: SymptomCategoryId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('图片大小不能超过8MB');
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

  const generate = useCallback(async () => {
    if (!selectedSpecies || selectedSymptoms.length === 0) return;
    setLoading(true);
    setError('');
    setPlan('');
    setStep('result');
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
      const result = generatePlan({
        petType: selectedSpecies,
        symptoms: selectedSymptoms,
        extra,
        detailed: true,
      });
      const output = result.detailedPlan || `${result.summary}\n\n${result.redFlags.map((f) => `- ${f}`).join('\n')}`;
      setPlan(output);
      if (!output) setError('未能生成内容，请重试。');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知错误。');
    } finally {
      setLoading(false);
    }
  }, [selectedSpecies, selectedSymptoms, extra]);

  const restart = () => {
    setStep('species');
    setSelectedSpecies(null);
    setSelectedSymptoms([]);
    setExtra('');
    setImageData(null);
    setPlan('');
    setError('');
  };

  const speciesName = selectedSpecies ? SPECIES_LIST.find((s) => s.id === selectedSpecies)?.labelZh ?? '' : '';

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-sm text-foreground">Mini Veterinarian</div>
              <div className="text-[10px] text-muted-foreground">宠物智能问诊</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {step !== 'species' && (
              <button
                onClick={restart}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">重新开始</span>
              </button>
            )}
            <Link
              href="/profile"
              className="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              个人中心
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['species', 'symptoms', 'result'] as Step[]).map((s, i) => {
            const labels = ['选择物种', '选择症状', '护理方案'];
            const active = step === s;
            const done = (['species', 'symptoms', 'result'] as Step[]).indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`w-6 h-px ${done ? 'bg-primary' : 'bg-border'}`} />}
                <div className={`flex items-center gap-1.5 ${active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    active ? 'bg-primary text-primary-foreground' : done ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className="text-xs font-medium hidden sm:inline">{labels[i]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1: Species selection */}
        {step === 'species' && (
          <section className="animate-fade-up">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">选择您的宠物物种</h1>
              <p className="text-sm text-muted-foreground">选择对应物种后，进入症状选择</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPECIES_LIST.map((species) => {
                const Icon = SPECIES_ICONS[species.id];
                const active = selectedSpecies === species.id;
                return (
                  <button
                    key={species.id}
                    onClick={() => setSelectedSpecies(species.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      active
                        ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      active ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-foreground">{species.labelZh}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{species.descZh}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      species.careDifficulty === 'easy' ? 'bg-success/10 text-success' :
                      species.careDifficulty === 'medium' ? 'bg-primary/10 text-primary' :
                      species.careDifficulty === 'hard' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {species.careDifficultyLabel}护理
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mt-7">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              <button
                onClick={() => selectedSpecies && setStep('symptoms')}
                disabled={!selectedSpecies}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Symptom selection */}
        {step === 'symptoms' && (
          <section className="animate-fade-up">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-lg font-bold text-foreground">选择症状（可多选）</h2>
              </div>
              <p className="text-xs text-muted-foreground pl-8">
                已选择物种：{speciesName} · 请勾选观察到的症状类别
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SYMPTOM_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const active = selectedSymptoms.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleSymptom(cat.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      active
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        active ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-1">{cat.labelZh}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{cat.descZh}</div>
                  </button>
                );
              })}
            </div>

            {/* Free text */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                补充说明 <span className="text-muted-foreground font-normal">（可选）</span>
              </label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="例如：持续两天不吃东西，精神萎靡…"
                className="w-full rounded-2xl border border-input bg-card p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[88px]"
                maxLength={300}
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">{extra.length}/300</div>
            </div>

            {/* Photo upload */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                上传宠物照片 <span className="text-muted-foreground font-normal">（可选）</span>
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
                  <img src={imageData} alt="宠物照片" className="w-full max-h-64 object-cover" />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="移除照片"
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
                  <span className="text-sm font-medium text-foreground">点击上传宠物照片</span>
                  <span className="text-[11px]">支持 JPG / PNG，最大 8MB</span>
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setStep('species')}
                className="inline-flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>
              <button
                onClick={generate}
                disabled={selectedSymptoms.length === 0 || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中…
                  </>
                ) : (
                  <>
                    生成方案
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Result */}
        {step === 'result' && (
          <section className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">护理方案</h2>
                <p className="text-xs text-muted-foreground">
                  {speciesName} ·{' '}
                  {selectedSymptoms
                    .map((s) => SYMPTOM_CATEGORIES.find((c) => c.id === s)?.labelZh ?? '')
                    .join('、')}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs whitespace-pre-wrap break-all leading-relaxed">{error}</p>
              </div>
            )}

            {loading && !plan && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">正在生成护理方案…</p>
              </div>
            )}

            {plan && (
              <>
                <div
                  className="prose-vet bg-card rounded-2xl border border-border p-5 shadow-sm text-sm text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }}
                />
                <div className="mt-3 flex items-start gap-2 p-4 rounded-2xl bg-warning/5 border border-warning/20">
                  <ShieldCheck className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">免责声明：</strong>
                    本方案由本地知识库生成，仅供参考，不能替代专业兽医诊断。如宠物情况严重或持续恶化，请立即就医。
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={generate}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/70 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>
              <button
                onClick={restart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                新的问诊
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
