'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RotateCcw, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { DiseaseCard } from '@/components/ui/DiseaseCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, scaleProbability } from '@/lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export function DiagnosisResult() {
  const {
    predictionResult,
    diagnosisText,
    isStreaming,
    setStep,
    resetFlow,
  } = useAppStore();

  const textEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [diagnosisText, isStreaming]);

  const pieData = predictionResult?.top_diseases.map((d) => ({
    name: d.disease_name,
    value: Math.round(scaleProbability(d.probability) * 100),
  })) || [];

  const radarData = predictionResult?.top_diseases.map((d) => ({
    disease: d.disease_name.split(' ').slice(0, 2).join(' '),
    confidence: Math.round(scaleProbability(d.probability) * 100),
    verification: d.rag_symptom_match ? 90 : 40,
    symptomMatch: Math.min(d.matched_symptoms.length * 20, 100),
  })) || [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Diagnosis Results
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            AI analysis complete • {predictionResult?.checked_symptoms.length || 0} symptoms analyzed
          </p>
        </div>
        <button
          onClick={resetFlow}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            'bg-[var(--bg-card)] border border-[var(--border)]',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'hover:border-[var(--border-hover)] transition-all duration-200'
          )}
        >
          <RotateCcw size={15} />
          New Diagnosis
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: predictions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Disease cards */}
          <AnimatePresence>
            {predictionResult?.top_diseases.map((disease, i) => (
              <DiseaseCard
                key={disease.disease_name}
                prediction={disease}
                rank={disease.rank}
                delay={i * 0.1}
              />
            ))}
          </AnimatePresence>

          {/* Streaming indicator if no predictions yet */}
          {!predictionResult && isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]"
            >
              <div className="flex gap-1">
                {[0, 0.15, 0.3].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                    className="w-2 h-2 rounded-full bg-indigo-500"
                  />
                ))}
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Analyzing symptoms with XGBoost + RAG...</span>
            </motion.div>
          )}

          {/* Medical explanation */}
          {diagnosisText && (() => {
            // Separate clean content from any error fragments
            const ERROR_LINE_RE = /^[\s]*⚠️\s*(Error|An error)[:\s].*/gim;
            const cleanText = diagnosisText.replace(ERROR_LINE_RE, '').trim();
            const hasError = ERROR_LINE_RE.test(diagnosisText);

            return (
              <>
                {cleanText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-indigo-500/15">
                        <Brain size={16} className="text-indigo-400" />
                      </div>
                      <span className="font-semibold text-[var(--text-primary)] text-sm">Medical Assessment</span>
                      {isStreaming && (
                        <span className="text-xs text-[var(--text-muted)] ml-auto flex items-center gap-1.5">
                          <motion.div
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          />
                          Streaming
                        </span>
                      )}
                    </div>
                    <div className={cn('prose-medical text-sm', isStreaming && !cleanText.endsWith('\n') && 'cursor-blink')}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cleanText}
                      </ReactMarkdown>
                    </div>
                    <div ref={textEndRef} />
                  </motion.div>
                )}

                {/* Error card if stream contained errors */}
                {hasError && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-red-500/8 border border-red-500/20 p-5 mt-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-400" />
                      <span className="text-sm font-semibold text-red-400">Response Interrupted</span>
                    </div>
                    <p className="text-sm text-red-300/80 leading-relaxed">
                      The AI encountered an issue while generating the full response. The content above may be incomplete. Please try again or use your own Gemini API key in Settings for more reliable results.
                    </p>
                  </motion.div>
                )}
              </>
            );
          })()}
        </div>

        {/* Right column: charts */}
        <div className="space-y-4">
          {/* Confidence summary */}
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-4">Confidence Distribution</p>
              <div className="space-y-3">
                {pieData.map((item, i) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
                      <span className="text-[var(--text-primary)] font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(8, item.value)}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Checked symptoms */}
          {predictionResult && predictionResult.checked_symptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Your Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {predictionResult.checked_symptoms.map((sym) => (
                  <span
                    key={sym}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--text-accent)] border border-[var(--border-accent)]"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Follow-up button */}
          {!isStreaming && diagnosisText && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('followup')}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-5 py-3.5 rounded-xl font-semibold text-sm',
                'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
                'shadow-lg hover:shadow-indigo-500/30 hover:shadow-xl transition-all'
              )}
            >
              <MessageSquare size={16} />
              Ask Follow-up Questions
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
