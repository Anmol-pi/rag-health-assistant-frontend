'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '@/lib/api';
import {
  Brain,
  Stethoscope,
  Activity,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { cn, formatDate } from '@/lib/utils';

const activityData = [
  { day: 'Mon', sessions: 3, verified: 2 },
  { day: 'Tue', sessions: 5, verified: 4 },
  { day: 'Wed', sessions: 2, verified: 2 },
  { day: 'Thu', sessions: 7, verified: 5 },
  { day: 'Fri', sessions: 4, verified: 3 },
  { day: 'Sat', sessions: 6, verified: 5 },
  { day: 'Sun', sessions: 8, verified: 7 },
];

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e879f9'];

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  padding: '10px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export default function DashboardPage() {
  const sessions = useAppStore((s) => s.sessions);
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: checkHealth, retry: false });

  const totalSessions = sessions.length;
  const verifiedPredictions = sessions.filter((s) =>
    s.predictions.some((p) => p.rag_symptom_match)
  ).length;
  const avgSymptoms =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.checkedSymptoms.length, 0) / sessions.length)
      : 0;

  const diseaseFreq: Record<string, number> = {};
  sessions.forEach((s) => {
    s.predictions.forEach((p) => {
      if (p.rank === 1) {
        diseaseFreq[p.disease_name] = (diseaseFreq[p.disease_name] || 0) + 1;
      }
    });
  });
  const topDiseases = Object.entries(diseaseFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.split(' ').slice(0, 2).join(' '),
      count,
    }));

  return (
    <AppShell title="Dashboard" subtitle="Your medical AI command center">
      <div className="p-6 lg:p-8 space-y-7">

        {/* Welcome banner (when empty) */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-[var(--bg-card)] p-7"
          >
            <div className="orb w-80 h-80 bg-indigo-600 -top-20 -right-20 opacity-10" />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-sm text-indigo-400 font-medium">Welcome to MedAI</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Start your first AI diagnosis
                </h2>
                <p className="text-[var(--text-secondary)] max-w-lg">
                  Describe your symptoms and let our XGBoost + RAG + Gemini pipeline analyze them in seconds.
                </p>
              </div>
              <Link href="/diagnose">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg cursor-pointer"
                >
                  <Stethoscope size={18} />
                  Start Diagnosis
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPICard
            title="Total Diagnoses"
            value={totalSessions}
            subtitle="All-time sessions"
            icon={<Stethoscope size={22} />}
            accentColor="#6366f1"
            delay={0}
          />
          <KPICard
            title="RAG Verified"
            value={verifiedPredictions}
            subtitle="Documentation matched"
            icon={<CheckCircle2 size={22} />}
            accentColor="#10b981"
            delay={0.07}
          />
          <KPICard
            title="Avg Symptoms"
            value={avgSymptoms}
            subtitle="Per diagnosis session"
            icon={<Activity size={22} />}
            accentColor="#f59e0b"
            delay={0.14}
          />
          <KPICard
            title="AI Models"
            value={health?.available_models.length ?? 4}
            subtitle="Gemini models available"
            icon={<Brain size={22} />}
            accentColor="#8b5cf6"
            delay={0.21}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Area chart — takes 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="xl:col-span-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">Weekly Activity</p>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">Diagnosis sessions over the past week</p>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-[var(--text-muted)]">Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-[var(--text-muted)]">Verified</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-muted)', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorS)" />
                <Area type="monotone" dataKey="verified" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar chart — 1 col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6"
          >
            <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">Top Diseases</p>
            <p className="text-sm text-[var(--text-muted)] mb-5">Most frequent predictions</p>

            {topDiseases.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topDiseases}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {topDiseases.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Run diagnoses to see disease insights" />
            )}
          </motion.div>
        </div>

        {/* Recent sessions table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
            <div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">Recent Sessions</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">Your latest diagnosis results</p>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-1.5 text-sm text-[var(--text-accent)] hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <Stethoscope size={48} className="mb-4 opacity-15" />
              <p className="text-base font-medium mb-2 text-[var(--text-secondary)]">No sessions yet</p>
              <p className="text-sm mb-6">Start your first diagnosis to see results here</p>
              <Link href="/diagnose">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/18 transition-colors">
                  <Stethoscope size={15} />
                  Start Diagnosis
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <span>Disease / Description</span>
                <span>Symptoms</span>
                <span>Confidence</span>
                <span>Date</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {sessions.slice(0, 6).map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.04 }}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-[var(--bg-glass)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Brain size={16} className="text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {session.predictions[0]?.disease_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {session.description.slice(0, 55)}…
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {session.checkedSymptoms.length} symptoms
                    </span>
                    <span className="text-sm font-bold text-indigo-400">
                      {Math.round((session.predictions[0]?.probability || 0) * 100)}%
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatDate(new Date(session.timestamp))}
                    </span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* System status */}
        {health && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
              <p className="text-base font-semibold text-[var(--text-primary)] mb-4">System Status</p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-[var(--text-primary)]">All systems operational</span>
                <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">v{health.version}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['XGBoost Model', 'RAG Database', 'Gemini LLM', 'Streaming API'].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
              <p className="text-base font-semibold text-[var(--text-primary)] mb-4">Available Models</p>
              <div className="grid grid-cols-1 gap-2">
                {health.available_models.map((model) => (
                  <div
                    key={model}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-mono text-[var(--text-primary)]">{model}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[240px] text-[var(--text-muted)]">
      <TrendingUp size={36} className="mb-3 opacity-20" />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}
