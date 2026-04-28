'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { Brain, Trash2, ChevronRight, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatProbability, getRiskLevel } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { sessions, clearSessions } = useAppStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = sessions.filter(
    (s) =>
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.predictions.some((p) => p.disease_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medai-sessions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sessions exported successfully');
  };

  return (
    <AppShell title="Diagnosis History" subtitle="All past diagnosis sessions">
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Actions bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className={cn(
            'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border',
            'bg-[var(--bg-card)] border-[var(--border)]',
            'focus-within:border-[var(--border-accent)] transition-colors'
          )}>
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by disease or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={sessions.length === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'bg-[var(--bg-card)] border border-[var(--border)]',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                'hover:border-[var(--border-hover)] transition-all',
                sessions.length === 0 && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Download size={15} />
              Export
            </button>
            <button
              onClick={() => { clearSessions(); toast.success('History cleared'); }}
              disabled={sessions.length === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'bg-red-500/10 border border-red-500/20 text-red-400',
                'hover:bg-red-500/15 transition-colors',
                sessions.length === 0 && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Trash2 size={15} />
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Session count */}
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]"
          >
            <Brain size={48} className="mb-4 opacity-20" />
            <p className="text-base font-medium mb-2">
              {search ? 'No results found' : 'No sessions yet'}
            </p>
            <p className="text-sm mb-6">
              {search ? 'Try a different search term' : 'Run your first diagnosis to start building history'}
            </p>
            {!search && (
              <Link href="/diagnose">
                <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors">
                  Start Diagnosis
                </button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session, i) => {
              const topDisease = session.predictions[0];
              const risk = topDisease ? getRiskLevel(topDisease.probability) : null;
              const isExpanded = expanded === session.id;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
                >
                  {/* Collapsed header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : session.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-glass)] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {topDisease?.disease_name || 'Unknown disease'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {session.description.slice(0, 80)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {risk && (
                        <span className={cn('text-xs font-semibold', risk.color)}>
                          {formatProbability(topDisease?.probability || 0)}
                        </span>
                      )}
                      <span className="text-[0.65rem] text-[var(--text-muted)] hidden sm:block">
                        {formatDate(new Date(session.timestamp))}
                      </span>
                      <ChevronRight
                        size={16}
                        className={cn(
                          'text-[var(--text-muted)] transition-transform duration-200',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--border)] p-5 space-y-4"
                    >
                      {/* Symptoms */}
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                          Confirmed Symptoms
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {session.checkedSymptoms.map((sym) => (
                            <span
                              key={sym}
                              className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--text-accent)] border border-[var(--border-accent)]"
                            >
                              {sym}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Predictions */}
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                          Predictions
                        </p>
                        <div className="space-y-2">
                          {session.predictions.map((pred) => (
                            <div key={pred.disease_name} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[var(--text-muted)] w-6">#{pred.rank}</span>
                              <span className="text-sm text-[var(--text-primary)] flex-1">{pred.disease_name}</span>
                              <div className="flex-1 max-w-24 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${pred.probability * 100}%` }}
                                />
                              </div>
                              <span className={cn('text-xs font-semibold w-12 text-right', getRiskLevel(pred.probability).color)}>
                                {formatProbability(pred.probability)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnosis excerpt */}
                      {session.diagnosisText && (
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                            Assessment
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                            {session.diagnosisText.slice(0, 300)}...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
