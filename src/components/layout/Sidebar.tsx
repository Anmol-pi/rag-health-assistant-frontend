'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  LayoutDashboard,
  History,
  Settings,
  Activity,
  HeartPulse,
  BarChart3,
  User,
  Stethoscope,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diagnose', label: 'Diagnose', icon: Stethoscope },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/history', label: 'History', icon: History },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const sessions = useAppStore((s) => s.sessions);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]',
          collapsed && 'justify-center px-3'
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Brain size={22} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--bg-secondary)] animate-pulse" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="font-bold text-[var(--text-primary)] text-xl leading-none">MedAI</div>
              <div className="text-[0.65rem] text-[var(--text-muted)] font-medium mt-0.5 tracking-widest uppercase">Diagnostic AI</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href} onClick={onMobileClose}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200',
                  'text-sm font-medium',
                  collapsed && 'justify-center px-0 w-12 mx-auto',
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--text-accent)] border border-[var(--border-accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={19}
                  className={cn('flex-shrink-0', isActive && 'text-[var(--accent)]')}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ml-auto flex-shrink-0"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Recent sessions */}
      <AnimatePresence>
        {!collapsed && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-[var(--border)]"
          >
            <p className="text-[0.65rem] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Recent
            </p>
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--bg-glass)] cursor-pointer group transition-colors"
              >
                <HeartPulse size={13} className="text-[var(--text-muted)] flex-shrink-0" />
                <span className="text-xs text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] transition-colors">
                  {session.predictions[0]?.disease_name || 'Unknown'}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl',
            'text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-glass)] transition-all duration-200'
          )}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={16} />
          </motion.div>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0',
          'bg-[var(--bg-secondary)] border-r border-[var(--border)]',
          'overflow-hidden'
        )}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden',
                'bg-[var(--bg-secondary)] border-r border-[var(--border)]'
              )}
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
