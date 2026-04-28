'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, RotateCcw, Mic, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { analyzeDescription } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const EXAMPLE_SYMPTOMS = [
  'I have been having severe headaches, fever, and stiff neck for 2 days',
  'I feel constant fatigue, weight loss, and night sweats for weeks',
  'Sharp chest pain, shortness of breath, and racing heartbeat',
  'Frequent urination, extreme thirst, and blurry vision',
  'Joint pain, skin rash on my face, and hair loss',
];

export function SymptomInput() {
  const {
    userDescription,
    setUserDescription,
    setStep,
    setSymptomCheckboxes,
    setClarifyingMessage,
    setFollowUpQuestion,
    setError,
    error,
    preferredModel,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [userDescription]);

  const handleSubmit = async () => {
    if (!userDescription.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }
    if (userDescription.trim().length < 10) {
      toast.error('Please provide more detail about your symptoms');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeDescription(userDescription);
      setSymptomCheckboxes(result.checkboxes);
      setClarifyingMessage(result.clarifying_message);
      setFollowUpQuestion(result.follow_up_question || null);
      setStep('symptoms');
      toast.success('Symptoms analyzed! Please confirm what applies to you.');
    } catch (err: any) {
      let msg = err?.response?.data?.detail || err?.message || 'Failed to analyze symptoms';
      // Make common backend errors more human-friendly
      if (/quota.*exceeded/i.test(msg) || /429/i.test(msg)) {
        msg = 'The AI service is temporarily rate-limited. Please wait a moment and try again, or add your own Gemini API key in Settings.';
      } else if (/Invalid operation.*response\.text/i.test(msg)) {
        msg = 'The AI model returned an empty response. Please try rephrasing your description.';
      } else if (msg.length > 200) {
        msg = msg.slice(0, 180) + '…';
      }
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-400 font-medium mb-6">
          <Sparkles size={14} />
          <span>AI-Powered Symptom Analysis</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
          How are you feeling?
        </h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
          Describe your symptoms in natural language. Our AI will analyze them and suggest possible conditions.
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'relative rounded-2xl border transition-all duration-300',
          'bg-[var(--bg-card)]',
          'input-ring',
          userDescription ? 'border-[var(--border-accent)]' : 'border-[var(--border)]'
        )}
      >
        <textarea
          ref={textareaRef}
          value={userDescription}
          onChange={(e) => setUserDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I've had a fever of 39°C for 3 days, with a severe headache, neck stiffness, and sensitivity to light..."
          className={cn(
            'w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'resize-none outline-none p-5 pr-16 min-h-[140px]',
            'text-base leading-relaxed'
          )}
          rows={4}
          disabled={isLoading}
        />

        {/* Character count + send button */}
        <div className="flex items-center justify-between px-5 pb-4">
          <span className={cn(
            'text-xs tabular-nums',
            userDescription.length > 800 ? 'text-amber-400' : 'text-[var(--text-muted)]'
          )}>
            {userDescription.length} chars • Ctrl+Enter to submit
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading || !userDescription.trim()}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm',
              'transition-all duration-200',
              userDescription.trim() && !isLoading
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 hover:shadow-xl'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example symptoms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <p className="text-xs text-[var(--text-muted)] mb-3 font-medium uppercase tracking-widest">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SYMPTOMS.map((ex, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserDescription(ex)}
              className={cn(
                'text-xs px-3 py-2 rounded-xl border text-left',
                'bg-[var(--bg-card)] border-[var(--border)]',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                'hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]',
                'transition-all duration-150 max-w-[260px] truncate'
              )}
            >
              {ex}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[var(--text-muted)] mt-8 text-center max-w-lg mx-auto"
      >
        ⚠️ MedAI provides general health information only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
      </motion.p>
    </div>
  );
}
