'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DiseasePrediction } from '@/lib/api';
import { formatProbability, getRiskLevel } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Target } from 'lucide-react';

interface DiseaseCardProps {
  prediction: DiseasePrediction;
  rank: number;
  delay?: number;
}

export function DiseaseCard({ prediction, rank, delay = 0 }: DiseaseCardProps) {
  const risk = getRiskLevel(prediction.probability);
  const probPercent = prediction.probability * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl p-5 border',
        'bg-[var(--bg-card)] card-hover',
        rank === 1
          ? 'border-[var(--border-accent)]'
          : 'border-[var(--border)]'
      )}
    >
      {rank === 1 && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
            <Target size={11} className="text-indigo-400" />
            <span className="text-[0.65rem] font-bold text-indigo-400 uppercase tracking-wider">Top Match</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
          rank === 1
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
        )}>
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] truncate pr-20">
            {prediction.disease_name}
          </h3>

          {/* Probability bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--text-muted)]">Confidence</span>
              <span className={cn('text-sm font-bold', risk.color)}>
                {formatProbability(prediction.probability)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(probPercent, 100)}%` }}
                transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  rank === 1
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : probPercent >= 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                )}
              />
            </div>
          </div>

          {/* Verification status */}
          <div className="mt-3 flex items-center gap-2">
            {prediction.rag_symptom_match ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={13} />
                <span>RAG Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle size={13} />
                <span>Partial Match</span>
              </div>
            )}
            <span className={cn('badge text-[0.6rem]', risk.color, risk.bgColor)}>
              {risk.label} Risk
            </span>
          </div>

          {/* Matched symptoms */}
          {prediction.matched_symptoms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prediction.matched_symptoms.slice(0, 4).map((sym) => (
                <span
                  key={sym}
                  className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)]"
                >
                  {sym}
                </span>
              ))}
              {prediction.matched_symptoms.length > 4 && (
                <span className="text-[0.65rem] px-2 py-0.5 rounded-full text-[var(--text-muted)]">
                  +{prediction.matched_symptoms.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
