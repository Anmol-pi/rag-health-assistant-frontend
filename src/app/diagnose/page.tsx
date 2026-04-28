'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { SymptomInput } from '@/components/diagnosis/SymptomInput';
import { SymptomCheckboxes } from '@/components/diagnosis/SymptomCheckboxes';
import { DiagnosisResult } from '@/components/diagnosis/DiagnosisResult';
import { DiagnosisChat } from '@/components/diagnosis/DiagnosisChat';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'input', label: 'Describe' },
  { id: 'symptoms', label: 'Confirm' },
  { id: 'diagnosis', label: 'Diagnose' },
  { id: 'followup', label: 'Follow-up' },
];

export default function DiagnosePage() {
  const step = useAppStore((s) => s.step);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <AppShell title="AI Diagnosis" subtitle="3-step medical assessment powered by XGBoost + Gemini">
      <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
        {/* Step progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-0 mb-10 max-w-lg mx-auto"
        >
          {STEPS.map((s, i) => {
            const isCompleted = i < currentStepIndex;
            const isActive = s.id === step;
            const isLast = i === STEPS.length - 1;

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    'transition-all duration-300',
                    isCompleted
                      ? 'bg-indigo-500 text-white'
                      : isActive
                      ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400'
                      : 'bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-muted)]'
                  )}>
                    {isCompleted ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
                  </div>
                  <span className={cn(
                    'text-[0.65rem] font-medium mt-1 hidden sm:block',
                    isActive ? 'text-indigo-400' : isCompleted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                  )}>
                    {s.label}
                  </span>
                </div>
                {!isLast && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2 rounded-full transition-all duration-500',
                    isCompleted ? 'bg-indigo-500' : 'bg-[var(--bg-tertiary)]'
                  )} />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SymptomInput />
            </motion.div>
          )}

          {step === 'symptoms' && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SymptomCheckboxes />
            </motion.div>
          )}

          {(step === 'diagnosis' || step === 'followup') && (
            <motion.div
              key="diagnosis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DiagnosisResult />
              {step === 'followup' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <DiagnosisChat />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
