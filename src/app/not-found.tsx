'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Home, RotateCcw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-6">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] opacity-10" />
        <div className="orb w-80 h-80 bg-purple-600 bottom-[-80px] right-[-80px] opacity-8" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        {/* 404 number */}
        <div className="text-[8rem] lg:text-[12rem] font-black leading-none text-gradient opacity-20 select-none mb-4">
          404
        </div>

        {/* Icon */}
        <div className="mb-6 -mt-8">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Brain size={40} className="text-indigo-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Page Not Found</h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. Navigate back to the dashboard or start a new diagnosis.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg cursor-pointer"
            >
              <Home size={16} />
              Go to Dashboard
            </motion.div>
          </Link>
          <Link href="/diagnose">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Start Diagnosis
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
