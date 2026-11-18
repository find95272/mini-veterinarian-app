'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, PawPrint, ClipboardList, Lock } from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: '欢迎使用 Mini Vet',
    desc: '你的智能宠物问诊助手。快速获取用药参考方案，科学照顾你的小伙伴。',
    color: 'from-primary to-[hsl(175,55%,30%)]',
  },
  {
    icon: Lock,
    title: '精简版 vs 完整版',
    desc: '未登录可使用精简版（纯文本方案）。登录后解锁完整版：含物种解剖图、护理步骤图解、用药剂量参考、就医决策流程图。',
    color: 'from-accent to-[hsl(35,70%,45%)]',
  },
  {
    icon: PawPrint,
    title: '添加宠物档案',
    desc: '登录后在个人中心添加你的宠物，记录品种、体重、过敏史等信息，获得更精准的方案。',
    color: 'from-primary to-[hsl(175,55%,30%)]',
  },
  {
    icon: ClipboardList,
    title: '获取护理方案',
    desc: '选择宠物物种和症状，10秒内生成个性化护理方案。登录后还可保存方案、设置提醒、追踪健康记录。',
    color: 'from-accent to-[hsl(35,70%,45%)]',
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('mini-vet-tour-seen');
      if (!seen) setVisible(true);
    } catch {}
  }, []);

  const close = () => {
    try { localStorage.setItem('mini-vet-tour-seen', '1'); } catch {}
    setVisible(false);
    onComplete();
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={close}
      >
        <motion.div
          key={step}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-card rounded-3xl border border-border shadow-2xl max-w-sm w-full p-6 relative"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          role="dialog"
          aria-label="新手引导"
        >
          <button
            onClick={close}
            className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="关闭引导"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shadow-lg mb-5`}
            >
              <Icon className="w-8 h-8" />
            </motion.div>

            <h3 className="text-lg font-bold text-foreground mb-2">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.desc}</p>

            <div className="flex gap-1.5 mb-5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 w-full">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {step === TOUR_STEPS.length - 1 ? '开始使用' : '下一步'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
