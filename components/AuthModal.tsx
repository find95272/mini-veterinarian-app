'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Loader2, Mail, Lock, User, Chrome, Github } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthed: () => void;
}

export default function AuthModal({ open, onClose, onAuthed }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setEmail('');
      setPassword('');
      setDisplayName('');
    }
  }, [open]);

  const [resetSent, setResetSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('请输入邮箱。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/',
      });
      if (error) throw error;
      setResetSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '发送重置邮件失败。');
    } finally {
      setLoading(false);
    }
  };

  const oauthLoading = useRef<string | null>(null);

  if (!open) return null;

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    oauthLoading.current = provider;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/' },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OAuth 登录失败，请稍后重试。');
      setLoading(false);
      oauthLoading.current = null;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写邮箱和密码。');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || undefined } },
        });
        if (error) throw error;
        if (data.session) {
          onAuthed();
          onClose();
        } else {
          setError('注册成功，请登录。');
          setMode('signin');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          onAuthed();
          onClose();
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '操作失败，请稍后重试。';
      setError(msg.includes('Invalid login') || msg.includes('credentials') ? '邮箱或密码错误。' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border/60 p-6 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-md">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {mode === 'signin' ? '登录账户' : mode === 'signup' ? '创建账户' : '重置密码'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === 'signin' ? '登录后即可保存您的问诊记录' : mode === 'signup' ? '注册后即可使用全部功能' : '输入邮箱，我们将发送重置链接'}
          </p>
        </div>

        {mode === 'reset' ? (
          <div className="space-y-3">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="text-sm text-foreground">重置链接已发送至</p>
                <p className="text-sm font-medium text-primary mt-1">{email}</p>
                <p className="text-xs text-muted-foreground mt-2">请检查邮箱并按提示操作。</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  发送重置链接
                </button>
              </form>
            )}
            <button
              onClick={() => { setMode('signin'); setResetSent(false); setError(''); }}
              className="w-full text-xs text-primary font-medium hover:underline"
            >
              返回登录
            </button>
          </div>
        ) : (
          <>
        {/* OAuth buttons */}
        <div className="space-y-2 mb-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-background border border-border text-foreground font-medium text-sm py-2.5 rounded-xl hover:bg-secondary/50 transition-all disabled:opacity-60"
          >
            <Chrome className="w-4 h-4" />
            Google 登录
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-background border border-border text-foreground font-medium text-sm py-2.5 rounded-xl hover:bg-secondary/50 transition-all disabled:opacity-60"
          >
            <Github className="w-4 h-4" />
            GitHub 登录
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground">或使用邮箱</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">昵称（可选）</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="您的称呼"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' ? '登录' : '注册'}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            onClick={() => { setMode('reset'); setError(''); }}
            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors mt-3"
          >
            忘记密码？
          </button>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === 'signin' ? '还没有账户？' : '已有账户？'}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
            className="text-primary font-medium ml-1 hover:underline"
          >
            {mode === 'signin' ? '立即注册' : '去登录'}
          </button>
        </p>
        </>
        )}
      </div>
    </div>
  );
}
