'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '@/lib/api';
import { cn } from '@/lib/utils';
import { TrendingUp, Brain, Activity, Stethoscope } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e879f9'];

export default function AnalyticsPage() {
  const sessions = useAppStore((s) => s.sessions);
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: checkHealth, retry: false });

  // Build analytics from sessions
  const diseaseMap: Record<string, { count: number; totalProb: number; verified: number }> = {};
  const symptomMap: Record<string, number> = {};
  const monthlyData: Record<string, number> = {};

  sessions.forEach((s) => {
    // Disease frequency
    s.predictions.forEach((p) => {
      if (!diseaseMap[p.disease_name]) {
        diseaseMap[p.disease_name] = { count: 0, totalProb: 0, verified: 0 };
      }
      diseaseMap[p.disease_name].count++;
      diseaseMap[p.disease_name].totalProb += p.probability;
      if (p.rag_symptom_match) diseaseMap[p.disease_name].verified++;
    });

    // Symptom frequency
    s.checkedSymptoms.forEach((sym) => {
      symptomMap[sym] = (symptomMap[sym] || 0) + 1;
    });

    // Monthly activity
    const month = new Date(s.timestamp).toLocaleString('default', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const topDiseaseData = Object.entries(diseaseMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, d]) => ({
      name: name.split(' ').slice(0, 2).join(' '),
      count: d.count,
      avgProb: Math.round((d.totalProb / d.count) * 100),
      verifiedPct: Math.round((d.verified / d.count) * 100),
    }));

  const topSymptomData = Object.entries(symptomMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }));

  const radarData = topDiseaseData.slice(0, 5).map((d) => ({
    disease: d.name,
    count: d.count,
    avgProb: d.avgProb,
    verified: d.verifiedPct,
  }));

  const verifiedCount = sessions.filter((s) => s.predictions.some((p) => p.rag_symptom_match)).length;
  const unverifiedCount = sessions.length - verifiedCount;
  const verificationPieData = [
    { name: 'RAG Verified', value: verifiedCount },
    { name: 'Partial Match', value: unverifiedCount },
  ];

  return (
    <AppShell title="Analytics" subtitle="Insights from your diagnosis history">
      <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* Summary bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: sessions.length, icon: <Stethoscope size={18} />, color: '#6366f1' },
            { label: 'Unique Diseases', value: Object.keys(diseaseMap).length, icon: <Brain size={18} />, color: '#8b5cf6' },
            { label: 'Unique Symptoms', value: Object.keys(symptomMap).length, icon: <Activity size={18} />, color: '#a78bfa' },
            { label: 'Verification Rate', value: sessions.length ? `${Math.round((verifiedCount / sessions.length) * 100)}%` : '0%', icon: <TrendingUp size={18} />, color: '#10b981' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-4"
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                {item.icon}
                <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Disease frequency bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
          >
            <p className="font-semibold text-[var(--text-primary)] mb-1">Disease Frequency</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Top predicted diseases by occurrence</p>
            {topDiseaseData.length > 0 ? (
              <BarSummaryList
                items={topDiseaseData.map((item, index) => ({
                  label: item.name,
                  value: item.count,
                  detail: `${item.verifiedPct}% verified · ${item.avgProb}% avg probability`,
                  color: COLORS[index % COLORS.length],
                }))}
              />
            ) : (
              <EmptyChart />
            )}
          </motion.div>

          {/* Verification pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
          >
            <p className="font-semibold text-[var(--text-primary)] mb-1">RAG Verification Rate</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">How many diagnoses had RAG-verified predictions</p>
            {sessions.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-[180px_1fr] items-center">
                <div
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-[var(--border)]"
                  style={{
                    background: `conic-gradient(#6366f1 0 ${sessions.length ? Math.round((verifiedCount / sessions.length) * 100) : 0}%, #374151 ${sessions.length ? Math.round((verifiedCount / sessions.length) * 100) : 0}% 100%)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[var(--bg-card)] text-center">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {sessions.length ? Math.round((verifiedCount / sessions.length) * 100) : 0}%
                    </span>
                    <span className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-[0.2em]">Verified</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <MetricRow label="RAG Verified" value={verifiedCount} tone="indigo" />
                  <MetricRow label="Partial Match" value={unverifiedCount} tone="slate" />
                  <MetricRow label="Total Sessions" value={sessions.length} tone="emerald" />
                </div>
              </div>
            ) : (
              <EmptyChart />
            )}
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Symptom frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
          >
            <p className="font-semibold text-[var(--text-primary)] mb-1">Most Common Symptoms</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Symptoms you've reported most frequently</p>
            {topSymptomData.length > 0 ? (
              <BarSummaryList
                items={topSymptomData.map((item, index) => ({
                  label: item.name,
                  value: item.count,
                  detail: 'Times reported',
                  color: COLORS[(index + 1) % COLORS.length],
                }))}
              />
            ) : (
              <EmptyChart />
            )}
          </motion.div>

          {/* Monthly trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
          >
            <p className="font-semibold text-[var(--text-primary)] mb-1">Monthly Trend</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Diagnosis sessions per month</p>
            {monthlyChartData.length > 0 ? (
              <BarSummaryList
                items={monthlyChartData.map((item, index) => ({
                  label: item.month,
                  value: item.count,
                  detail: 'Sessions in month',
                  color: COLORS[(index + 2) % COLORS.length],
                }))}
              />
            ) : (
              <EmptyChart />
            )}
          </motion.div>
        </div>

        {/* AI Models info */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
          >
            <p className="font-semibold text-[var(--text-primary)] mb-4">Available AI Models</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {health.available_models.map((model, i) => (
                <div
                  key={model}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-mono text-[var(--text-primary)]">{model}</p>
                    <p className="text-[0.6rem] text-[var(--text-muted)]">Google Gemini</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-[var(--text-muted)]">
      <Brain size={32} className="mb-3 opacity-20" />
      <p className="text-sm">No data yet — run diagnoses to see analytics</p>
    </div>
  );
}

function BarSummaryList({
  items,
}: {
  items: Array<{
    label: string;
    value: number;
    detail: string;
    color: string;
  }>;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = Math.max(6, Math.round((item.value / maxValue) * 100));

        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
              <span className="text-[var(--text-muted)]">{item.value} · {item.detail}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, background: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: number; tone: 'indigo' | 'slate' | 'emerald' }) {
  const toneClasses = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    slate: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  } as const;

  return (
    <div className={cn('flex items-center justify-between gap-4 rounded-xl border px-4 py-3', toneClasses[tone])}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
