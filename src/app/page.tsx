'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Stethoscope, BarChart3, ArrowRight, Sparkles, Shield, Zap, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'XGBoost AI Engine',
    desc: 'Trained on hundreds of thousands of medical cases to predict diseases with high accuracy',
    color: '#6366f1',
  },
  {
    icon: Shield,
    title: 'RAG Verification',
    desc: 'Every prediction is cross-validated against structured medical documentation',
    color: '#8b5cf6',
  },
  {
    icon: Sparkles,
    title: 'Gemini LLM',
    desc: "Google's Gemini generates human-readable explanations grounded in medical knowledge",
    color: '#a78bfa',
  },
  {
    icon: Zap,
    title: 'Real-time Streaming',
    desc: 'Answers stream in real-time so you get insights as fast as possible',
    color: '#c4b5fd',
  },
];

const stats = [
  { value: '238+', label: 'Diseases Covered' },
  { value: '695', label: 'Symptom Features' },
  { value: '3-Step', label: 'Diagnosis Flow' },
  { value: '99.9%', label: 'Uptime' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] animated-gradient overflow-hidden">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] opacity-10" />
        <div className="orb w-80 h-80 bg-purple-600 bottom-[-80px] right-[-80px] opacity-8" />
        <div className="orb w-64 h-64 bg-violet-500 top-1/2 right-1/4 opacity-5" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--text-primary)]">MedAI</span>
          <span className="text-[0.6rem] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full font-mono">v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
          >
            Dashboard
          </Link>
          <Link
            href="/diagnose"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
              'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
              'shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 hover:scale-105'
            )}
          >
            Start Diagnosis
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-400 font-medium mb-8">
            <HeartPulse size={14} className="animate-pulse" />
            <span>Powered by XGBoost + RAG + Gemini AI</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-[var(--text-primary)] leading-none mb-6">
            AI Medical
            <span className="block text-gradient mt-2">Diagnostics</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your symptoms in plain language. Our AI analyzes them using advanced machine learning, medical databases, and Gemini to provide intelligent health insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/diagnose">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg',
                  'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
                  'shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50',
                  'transition-shadow duration-300 cursor-pointer'
                )}
              >
                <Stethoscope size={22} />
                Start Free Diagnosis
                <ArrowRight size={18} />
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg',
                  'bg-[var(--bg-card)] border border-[var(--border)]',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  'hover:border-[var(--border-hover)] transition-all cursor-pointer'
                )}
              >
                <BarChart3 size={20} />
                View Dashboard
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            World-Class AI Technology
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            A hybrid pipeline combining multiple AI systems for accurate, reliable medical insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={cn(
                  'p-6 rounded-2xl border',
                  'bg-[var(--bg-card)] border-[var(--border)]',
                  'cursor-default transition-all duration-300',
                  'hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/20'
                )}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${feature.color}18` }}
                >
                  <Icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={cn(
            'relative overflow-hidden rounded-3xl p-12 text-center',
            'bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-[var(--bg-card)]',
            'border border-indigo-500/20'
          )}
        >
          <div className="orb w-64 h-64 bg-indigo-600 top-[-60px] right-[-60px] opacity-20" />
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            Describe your symptoms and get an AI-powered health assessment in under 60 seconds.
          </p>
          <Link href="/diagnose">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'inline-flex items-center gap-3 px-8 py-4 rounded-2xl',
                'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
                'font-bold text-lg shadow-2xl shadow-indigo-500/30 cursor-pointer'
              )}
            >
              <Stethoscope size={22} />
              Start Your Diagnosis
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-indigo-400" />
            <span className="text-sm text-[var(--text-muted)]">MedAI © 2026. For informational purposes only.</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
