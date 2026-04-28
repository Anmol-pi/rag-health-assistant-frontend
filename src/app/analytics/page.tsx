'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '@/lib/api';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, Brain, Activity, Stethoscope } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e879f9'];

const CustomTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  padding: '8px 12px',
};

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
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topDiseaseData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="count" name="Occurrences" radius={[6, 6, 0, 0]}>
                    {topDiseaseData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={verificationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#374151" />
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-xs text-[var(--text-muted)]">RAG Verified</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{verifiedCount}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-muted)]">Partial</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{unverifiedCount}</p>
                  </div>
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
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={topSymptomData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="count" name="Times reported" radius={[0, 6, 6, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Sessions"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
