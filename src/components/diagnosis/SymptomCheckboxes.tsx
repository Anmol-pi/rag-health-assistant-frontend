'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, RotateCcw, Loader2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { generateDiagnosisStream } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function SymptomCheckboxes() {
  const {
    symptomCheckboxes,
    toggleSymptom,
    clarifyingMessage,
    followUpQuestion,
    userDescription,
    setStep,
    setPredictionResult,
    setDiagnosisText,
    setIsStreaming,
    addChatMessage,
    clearChat,
    preferredModel,
    addSession,
    resetFlow,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkedCount = symptomCheckboxes.filter((c) => c.checked).length;
  const checkedSymptoms = symptomCheckboxes
    .filter((c) => c.checked)
    .map((c) => c.symptom_key);

  const handleDiagnose = async () => {
    if (checkedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDiagnosisText('');
    setPredictionResult(null);
    clearChat();

    try {
      setStep('diagnosis');
      setIsStreaming(true);

      let fullText = '';

      await generateDiagnosisStream(
        checkedSymptoms,
        userDescription,
        [],
        preferredModel,
        (prediction) => {
          setPredictionResult(prediction);
        },
        (chunk) => {
          fullText += chunk;
          setDiagnosisText(fullText);
        }
      );

      setIsStreaming(false);

      // Save to session history
      const store = useAppStore.getState();
      if (store.predictionResult) {
        addSession({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          description: userDescription,
          checkedSymptoms,
          predictions: store.predictionResult.top_diseases,
          diagnosisText: fullText,
          followUpHistory: [],
        });
      }

      // Add to chat history for follow-ups
      addChatMessage({ role: 'user', content: userDescription });
      addChatMessage({ role: 'assistant', content: fullText });

      toast.success('Diagnosis complete! You can now ask follow-up questions.');
    } catch (err: any) {
      setIsStreaming(false);
      setStep('symptoms');
      const rawMsg = err?.message || 'Diagnosis failed. Please try again.';
      // Truncate excessively long error messages
      const msg = rawMsg.length > 200 ? rawMsg.slice(0, 180) + '…' : rawMsg;
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => setStep('input')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors"
        >
          <RotateCcw size={14} />
          Start over
        </button>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/20">
          <Sparkles size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{clarifyingMessage}</p>
            {followUpQuestion && (
              <p className="text-sm text-indigo-400 mt-2 flex items-center gap-1.5">
                <HelpCircle size={13} />
                {followUpQuestion}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Symptom grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
        {symptomCheckboxes.map((checkbox, index) => (
          <motion.button
            key={checkbox.symptom_key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleSymptom(checkbox.symptom_key)}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl border text-left',
              'transition-all duration-200 cursor-pointer',
              checkbox.checked
                ? 'bg-indigo-500/10 border-indigo-500/30 text-[var(--text-primary)]'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            {/* Custom checkbox */}
            <div className={cn(
              'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center',
              'transition-all duration-200',
              checkbox.checked
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-[var(--border-hover)]'
            )}>
              <AnimatePresence>
                {checkbox.checked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={12} className="text-white stroke-[3]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-sm font-medium flex-1">
              {checkbox.symptom_label}
            </span>

            <span className="text-[0.65rem] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-md hidden sm:block">
              {checkbox.symptom_key}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="text-sm text-[var(--text-muted)]">
          <span className="text-[var(--text-primary)] font-semibold">{checkedCount}</span>
          {' '}of{' '}
          <span>{symptomCheckboxes.length}</span> symptoms selected
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDiagnose}
          disabled={isLoading || checkedCount === 0}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm',
            'transition-all duration-200',
            checkedCount > 0 && !isLoading
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:shadow-xl'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <span>Run Diagnosis</span>
              <ChevronRight size={16} />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
