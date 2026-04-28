'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMobileMenuClick?: () => void;
}

export function Topbar({ title, subtitle, onMobileMenuClick }: TopbarProps) {
  const { theme, setTheme } = useAppStore();

  const { data: health, isError } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
    retry: false,
  });

  const isOnline = !!health && !isError;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between',
        'px-6 lg:px-8 py-4',
        'border-b border-[var(--border)]'
      )}
      style={{ background: 'var(--bg-primary)', backdropFilter: 'blur(16px)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* API status pill */}
        <div className={cn(
          'hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        )}>
          {isOnline ? (
            <Wifi size={14} />
          ) : (
            <WifiOff size={14} />
          )}
          <span>{isOnline ? 'API Online' : 'API Offline'}</span>
          {isOnline && health && (
            <span className="text-[var(--text-muted)] ml-0.5 font-mono text-xs">v{health.version}</span>
          )}
        </div>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'p-3 rounded-xl transition-all duration-200',
            'hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'border border-transparent hover:border-[var(--border)]'
          )}
          aria-label="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>
        </motion.button>
      </div>
    </motion.header>
  );
}
