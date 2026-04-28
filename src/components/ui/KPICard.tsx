'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'var(--accent)',
  delay = 0,
}: KPICardProps) {
  const trendPositive = trend && trend.value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-[var(--bg-card)] border border-[var(--border)]',
        'card-hover cursor-default'
      )}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5"
        style={{ background: accentColor }}
      />
      
      <div className="flex items-start justify-between">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: `${accentColor}18` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
            trendPositive
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-red-400 bg-red-500/10'
          )}>
            <span>{trendPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <motion.div
          className="text-3xl font-bold text-[var(--text-primary)] tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {value}
        </motion.div>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  );
}
