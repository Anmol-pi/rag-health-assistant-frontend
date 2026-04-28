'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { followUpStream, ChatMessage } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Detect error markers that may appear in assistant messages (historical)
const ERROR_MARKER = /^\u26a0\ufe0f\s*(Error|An error)/i;

export function DiagnosisChat() {
  const {
    chatHistory,
    addChatMessage,
    predictionResult,
    preferredModel,
    setStep,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamError, setStreamError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory, streamingMessage, streamError]);

  const contextDiseases = predictionResult?.top_diseases.map((d) => d.disease_name) || [];

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const question = input.trim();
    setInput('');
    setIsTyping(true);
    setStreamingMessage('');
    setStreamError(null);

    addChatMessage({ role: 'user', content: question });

    let fullResponse = '';

    try {
      await followUpStream(
        question,
        chatHistory,
        contextDiseases,
        preferredModel,
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      );

      // Only add the assistant message if we got real content
      if (fullResponse.trim()) {
        addChatMessage({ role: 'assistant', content: fullResponse });
      }
      setStreamingMessage('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to get answer. Please try again.';
      setStreamError(msg);
      setStreamingMessage('');
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTED_QUESTIONS = [
    'What medications are typically used for this condition?',
    'When should I see a doctor immediately?',
    'What lifestyle changes can help?',
    'Are there any complications I should watch for?',
  ];

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <button
          onClick={() => setStep('diagnosis')}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15">
            <Bot size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Medical Follow-up Assistant</p>
            <p className="text-[0.65rem] text-[var(--text-muted)]">
              Grounded in RAG medical documentation • {contextDiseases.join(', ')}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto p-5 space-y-4">
        {/* Suggested questions when chat is fresh */}
        {chatHistory.length <= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-xl border',
                    'bg-[var(--bg-tertiary)] border-[var(--border)]',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    'hover:border-[var(--border-hover)] transition-all'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message history */}
        {chatHistory.map((msg, i) => {
          // Filter out legacy error messages that were previously stored in chat
          const isLegacyError = msg.role === 'assistant' && ERROR_MARKER.test(msg.content);
          if (isLegacyError) return null;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                msg.role === 'user'
                  ? 'bg-indigo-500/20 border border-indigo-500/30'
                  : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'
              )}>
                {msg.role === 'user' ? (
                  <User size={14} className="text-indigo-400" />
                ) : (
                  <Bot size={14} className="text-[var(--text-muted)]" />
                )}
              </div>

              {/* Message bubble */}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-indigo-500/15 border border-indigo-500/20 text-[var(--text-primary)] rounded-tr-sm'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-tl-sm'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose-medical text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Streaming response */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <Bot size={14} className="text-[var(--text-muted)]" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
              {streamingMessage ? (
                <div className="prose-medical text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingMessage}
                  </ReactMarkdown>
                  <span className="inline-block w-1 h-4 bg-indigo-400 ml-0.5 animate-pulse rounded-sm" />
                </div>
              ) : (
                <div className="flex gap-1 py-1">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Stream error card */}
        {streamError && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-red-500/15 border border-red-500/25">
              <AlertTriangle size={14} className="text-red-400" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-red-500/8 border border-red-500/20">
              <p className="text-red-400 font-medium text-xs mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Something went wrong
              </p>
              <p className="text-red-300/80 text-sm leading-relaxed">{streamError}</p>
              <button
                onClick={() => setStreamError(null)}
                className="mt-2 text-xs text-red-400/70 hover:text-red-300 underline underline-offset-2 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question... (Enter to send)"
            rows={1}
            className={cn(
              'flex-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 text-sm',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'border border-[var(--border)] focus:border-[var(--border-accent)] focus:outline-none',
              'resize-none transition-colors'
            )}
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
              'transition-all duration-200',
              input.trim() && !isTyping
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            )}
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
