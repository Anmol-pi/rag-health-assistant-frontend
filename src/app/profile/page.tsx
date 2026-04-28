'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { Brain, Stethoscope, Clock, Activity, HeartPulse, User as UserIcon } from 'lucide-react';
import { formatDate, formatProbability } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { sessions, preferredModel } = useAppStore();

  const totalDiagnoses = sessions.length;
  const avgSymptoms = sessions.length > 0
    ? (sessions.reduce((a, s) => a + s.checkedSymptoms.length, 0) / sessions.length).toFixed(1)
    : 0;

  const verifiedSessions = sessions.filter((s) => s.predictions.some((p) => p.rag_symptom_match)).length;
  const verificationRate = sessions.length > 0 ? Math.round((verifiedSessions / sessions.length) * 100) : 0;

  const favoriteDisease = (() => {
    const freq: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.predictions[0]) {
        const d = s.predictions[0].disease_name;
        freq[d] = (freq[d] || 0) + 1;
      }
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  return (
    <AppShell title="Profile" subtitle="Your health journey overview">
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-[var(--bg-card)] border border-indigo-500/20 p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <UserIcon size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[var(--bg-card)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Health Profile</h2>
              <p className="text-[var(--text-muted)] mt-1 text-sm">
                Using <span className="text-indigo-400 font-mono">{preferredModel}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {totalDiagnoses} Diagnoses
                </span>
                <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {verificationRate}% Verified
                </span>
                <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  AI Patient
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Diagnoses', value: totalDiagnoses, icon: <Stethoscope size={18} />, color: '#6366f1' },
            { label: 'Avg Symptoms', value: avgSymptoms, icon: <Activity size={18} />, color: '#8b5cf6' },
            { label: 'Verification Rate', value: `${verificationRate}%`, icon: <HeartPulse size={18} />, color: '#10b981' },
            { label: 'Top Condition', value: favoriteDisease.split(' ')[0], icon: <Brain size={18} />, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-4"
            >
              <div style={{ color: stat.color }} className="mb-2">{stat.icon}</div>
              <p className="text-xl font-bold text-[var(--text-primary)] truncate">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent activity timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text-primary)]">Diagnosis Timeline</p>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
              <Clock size={40} className="mb-4 opacity-20" />
              <p className="text-sm">No diagnoses yet</p>
            </div>
          ) : (
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
                <div className="space-y-5">
                  {sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex gap-4 pl-8 relative"
                    >
                      {/* Dot */}
                      <div className={cn(
                        'absolute left-2.5 top-3 w-3 h-3 rounded-full border-2',
                        session.predictions[0]?.rag_symptom_match
                          ? 'bg-emerald-400 border-emerald-500'
                          : 'bg-amber-400 border-amber-500'
                      )} />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {session.predictions[0]?.disease_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {session.checkedSymptoms.length} symptoms • {formatProbability(session.predictions[0]?.probability || 0)} confidence
                            </p>
                          </div>
                          <span className="text-[0.65rem] text-[var(--text-muted)] flex-shrink-0">
                            {formatDate(new Date(session.timestamp))}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2">
                          {session.description.slice(0, 100)}...
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
