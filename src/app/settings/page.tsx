'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import { checkHealth, fetchGeminiModels, GeminiModelInfo } from '@/lib/api';
import {
  Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink,
  Trash2, Info, Shield, Cpu, Moon, Sun, Settings as SettingsIcon,
  RefreshCw, X, Zap, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const {
    theme, setTheme,
    preferredModel, setPreferredModel,
    geminiApiKey, setGeminiApiKey,
    fetchedModels, setFetchedModels,
    sessions, clearSessions, resetFlow,
  } = useAppStore();

  const { data: health } = useQuery({ queryKey: ['health'], queryFn: checkHealth, retry: false });

  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keyDirty, setKeyDirty] = useState(false);

  // Model fetch state (local)
  const [modelList, setModelList] = useState<GeminiModelInfo[]>([]);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fetchError, setFetchError] = useState('');

  const isKeyValid = keyInput.trim().startsWith('AIza') && keyInput.trim().length > 20;
  const isKeySet = geminiApiKey.length > 0;

  // Re-populate local model list from store when component mounts
  useEffect(() => {
    if (fetchedModels.length > 0) setFetchStatus('success');
  }, []);

  const doFetchModels = async (key: string) => {
    if (!key.trim()) return;
    setFetchStatus('loading');
    setFetchError('');
    try {
      const models = await fetchGeminiModels(key.trim());
      setModelList(models);
      setFetchedModels(models.map((m) => m.id));
      setFetchStatus('success');
      toast.success(`Found ${models.length} models available to your key`);
      // Auto-select best available model if current one isn't in list
      if (models.length > 0 && !models.find((m) => m.id === preferredModel)) {
        const flash = models.find((m) => m.id.includes('flash') && !m.id.includes('exp'));
        if (flash) setPreferredModel(flash.id);
      }
    } catch (err: any) {
      setFetchStatus('error');
      setFetchError(err?.message || 'Failed to fetch models');
      toast.error(`Model fetch failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleKeySave = async () => {
    const trimmed = keyInput.trim();
    setGeminiApiKey(trimmed);
    setKeyDirty(false);
    if (trimmed) {
      toast.success('API key saved — fetching your available models…');
      await doFetchModels(trimmed);
    } else {
      setFetchedModels([]);
      setModelList([]);
      setFetchStatus('idle');
      toast.success('API key cleared — using server default');
    }
  };

  const handleKeyClear = () => {
    setKeyInput('');
    setGeminiApiKey('');
    setFetchedModels([]);
    setModelList([]);
    setFetchStatus('idle');
    setKeyDirty(false);
    toast.success('API key removed');
  };

  // Model options: dynamic list when fetched, else fall back to health models
  const serverModels = health?.available_models ?? [
    'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b',
  ];
  const displayModels = isKeySet && modelList.length > 0 ? modelList : null;

  return (
    <AppShell title="Settings" subtitle="Configure your MedAI preferences">
      <div className="p-6 lg:p-8 max-w-3xl space-y-5">

        {/* ── Gemini API Key ───────────────────────────────── */}
        <Section title="Gemini API Key" icon={<Key size={18} />}
          badge={isKeySet ? { label: 'Custom Key Active', color: 'emerald' } : { label: 'Using Server Key', color: 'muted' }}
        >
          {/* Status banner */}
          <div className={cn(
            'flex items-start gap-3 p-4 rounded-xl border mb-5 text-sm',
            isKeySet ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-indigo-500/8 border-indigo-500/20'
          )}>
            {isKeySet ? <CheckCircle2 size={17} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <Shield size={17} className="text-indigo-400 mt-0.5 flex-shrink-0" />}
            <div>
              <p className={cn('font-semibold text-sm', isKeySet ? 'text-emerald-400' : 'text-indigo-400')}>
                {isKeySet ? 'Your Gemini API key is active' : 'Using server-provided API key'}
              </p>
              <p className="text-xs mt-0.5 text-[var(--text-muted)]">
                {isKeySet
                  ? 'All requests use your key and quota. Models available to your account are shown below.'
                  : 'Add your own key to use your quota, access more models, or unlock higher rate limits.'}
              </p>
            </div>
          </div>

          {/* Input row */}
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Your Gemini API Key</label>
          <div className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all',
            'bg-[var(--bg-input)]',
            keyDirty && isKeyValid ? 'border-emerald-500/40'
            : keyDirty && keyInput.length > 0 ? 'border-amber-500/40'
            : 'border-[var(--border)] focus-within:border-[var(--border-accent)]'
          )}>
            <Key size={15} className="text-[var(--text-muted)] flex-shrink-0" />
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); setKeyDirty(true); }}
              placeholder="AIzaSy••••••••••••••••••••••••••••"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none font-mono"
              autoComplete="off" spellCheck={false}
            />
            {keyInput.length > 0 && (
              <button onClick={() => { setKeyInput(''); setKeyDirty(true); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
                <X size={13} />
              </button>
            )}
            <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <AnimatePresence>
            {keyDirty && keyInput.length > 0 && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={cn('flex items-center gap-1.5 mt-2 text-xs', isKeyValid ? 'text-emerald-400' : 'text-amber-400')}
              >
                {isKeyValid ? <><CheckCircle2 size={12} /> Looks like a valid Gemini API key</> : <><AlertCircle size={12} /> Keys typically start with "AIza" and are 39+ chars</>}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleKeySave}
              disabled={!keyDirty && keyInput === geminiApiKey}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                (keyDirty || keyInput !== geminiApiKey)
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
              )}
            >
              <CheckCircle2 size={15} />
              Save Key
            </motion.button>

            {isKeySet && (
              <>
                <button onClick={() => doFetchModels(geminiApiKey)}
                  disabled={fetchStatus === 'loading'}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <RefreshCw size={14} className={cn(fetchStatus === 'loading' && 'animate-spin')} />
                  {fetchStatus === 'loading' ? 'Fetching…' : 'Refresh Models'}
                </button>
                <button onClick={handleKeyClear}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  <Trash2 size={14} /> Remove Key
                </button>
              </>
            )}

            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <ExternalLink size={13} /> Get API Key
            </a>
          </div>

          {/* Fetch error */}
          {fetchStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            🔒 Your key is stored in your browser only and sent directly to our backend as the <code className="font-mono text-[0.7rem] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">X-Gemini-Key</code> header, which forwards it to Google on your behalf.
          </p>
        </Section>

        {/* ── AI Model ─────────────────────────────────────── */}
        <Section title="AI Configuration" icon={<Cpu size={18} />}>
          <div className="space-y-5">
            <Row label="Preferred Gemini Model"
              description={isKeySet && displayModels ? `${displayModels.length} models available to your key` : 'Models available on the server'}
            >
              <div className="min-w-[260px]">
                {isKeySet && fetchStatus === 'loading' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
                    <RefreshCw size={14} className="animate-spin" />
                    Fetching your models…
                  </div>
                ) : displayModels ? (
                  /* Dynamic model list */
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={preferredModel}
                        onChange={(e) => { setPreferredModel(e.target.value); toast.success('Model updated'); }}
                        className="w-full px-3 py-2.5 pr-8 rounded-xl text-sm font-mono bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] transition-colors appearance-none"
                      >
                        <option value="" style={{ background: 'var(--bg-card)' }}>Server Default</option>
                        {displayModels.map((m) => (
                          <option key={m} value={m.id} style={{ background: 'var(--bg-card)' }}>
                            {m.displayName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                    {/* Selected model detail */}
                    {(() => {
                      const sel = displayModels.find((m) => m.id === preferredModel);
                      if (!sel) return null;
                      return (
                        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Zap size={12} className="text-indigo-400" />
                            <span className="text-xs font-mono text-[var(--text-muted)]">{sel.id}</span>
                          </div>
                          <div className="flex gap-3 text-xs text-[var(--text-muted)]">
                            <span>In: {(sel.inputTokenLimit / 1000).toFixed(0)}K tokens</span>
                            <span>Out: {(sel.outputTokenLimit / 1000).toFixed(0)}K tokens</span>
                          </div>
                          {sel.description && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2">{sel.description}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* Server models fallback */
                  <div className="relative">
                    <select
                      value={preferredModel}
                      onChange={(e) => { setPreferredModel(e.target.value); toast.success('Model updated'); }}
                      className="w-full px-3 py-2.5 pr-8 rounded-xl text-sm font-mono bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] transition-colors appearance-none"
                    >
                      <option value="" style={{ background: 'var(--bg-card)' }}>Server Default</option>
                      {serverModels.map((m) => (
                        <option key={m} value={m} style={{ background: 'var(--bg-card)' }}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                )}
              </div>
            </Row>

            <Row label="Pipeline Mode" description="XGBoost prediction → RAG verification → Gemini streaming">
              <div className="px-3 py-2 rounded-xl text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Hybrid RAG-XGBoost ✓
              </div>
            </Row>
          </div>
        </Section>

        {/* ── Appearance ───────────────────────────────────── */}
        <Section title="Appearance" icon={<Moon size={18} />}>
          <Row label="Theme" description="Choose between dark and light interface">
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button key={t} onClick={() => { setTheme(t); toast.success(`${t} mode activated`); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    theme === t
                      ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
                      : 'bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  )}
                >
                  {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  {t === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* ── API Connection ───────────────────────────────── */}
        <Section title="API Connection" icon={<Shield size={18} />}>
          <div className="space-y-4">
            <Row label="Backend URL" description="FastAPI server endpoint">
              <code className="text-xs px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] font-mono">
                {process.env.NEXT_PUBLIC_API_URL || 'https://medai-backend-production-a830.up.railway.app'}
              </code>
            </Row>
            <Row label="Auth Header" description="X-Api-Key for backend auth">
              <code className="text-xs px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)] font-mono">••••••••</code>
            </Row>
            <Row label="Gemini Key Header" description="X-Gemini-Key forwarded to Google">
              <span className={cn('text-xs px-3 py-2 rounded-xl border font-medium',
                isKeySet ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)]'
              )}>
                {isKeySet ? '✓ Custom key active' : 'Using server default'}
              </span>
            </Row>
          </div>
        </Section>

        {/* ── Data & Privacy ───────────────────────────────── */}
        <Section title="Data & Privacy" icon={<SettingsIcon size={18} />}>
          <div className="space-y-4">
            <Row label="Session History" description={`${sessions.length} session${sessions.length !== 1 ? 's' : ''} stored locally`}>
              <button onClick={() => { clearSessions(); toast.success('History cleared'); }} disabled={sessions.length === 0}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors',
                  sessions.length === 0 && 'opacity-40 cursor-not-allowed'
                )}
              >
                <Trash2 size={14} /> Clear History
              </button>
            </Row>
            <Row label="Reset Diagnosis Flow" description="Clear current in-progress diagnosis">
              <button onClick={() => { resetFlow(); toast.success('Flow reset'); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 transition-colors"
              >
                Reset Flow
              </button>
            </Row>
          </div>
        </Section>

        {/* ── About ────────────────────────────────────────── */}
        <Section title="About MedAI" icon={<Info size={18} />}>
          <div className="space-y-2 text-sm">
            {[
              ['Frontend', 'Next.js 15 + TypeScript'],
              ['Backend', `FastAPI v${health?.version ?? '1.0.0'}`],
              ['ML Pipeline', 'XGBoost + RAG + Gemini'],
              ['Diseases Covered', '238+'],
              ['Symptom Features', '695'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="font-mono text-xs text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <p className="text-xs text-amber-400/90 leading-relaxed">
              ⚠️ MedAI provides general health information only. It does not replace professional medical diagnosis or treatment. Always consult a qualified healthcare provider.
            </p>
          </div>
        </Section>

      </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function Section({ title, icon, badge, children }: {
  title: string; icon: React.ReactNode;
  badge?: { label: string; color: 'emerald' | 'muted' };
  children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-muted)]">{icon}</div>
        <p className="font-semibold text-[var(--text-primary)]">{title}</p>
        {badge && (
          <span className={cn('ml-auto badge text-[0.65rem]',
            badge.color === 'emerald'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)]'
          )}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
