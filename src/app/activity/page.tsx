'use client';

import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/appStore';
import { Clock, Brain, CheckCircle2, XCircle, AlertCircle, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ActivityType = 'diagnosis_started' | 'diagnosis_completed' | 'followup' | 'session_cleared';

interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const TYPE_ICONS: Record<ActivityType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  diagnosis_started: { icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  diagnosis_completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  followup: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  session_cleared: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function ActivityPage() {
  const sessions = useAppStore((s) => s.sessions);

  // Build activity log from sessions
  const activities: ActivityLog[] = sessions.flatMap((session) => [
    {
      id: `${session.id}-started`,
      type: 'diagnosis_started' as ActivityType,
      description: `Started diagnosis: "${session.description.slice(0, 60)}..."`,
      timestamp: new Date(session.timestamp),
    },
    {
      id: `${session.id}-completed`,
      type: 'diagnosis_completed' as ActivityType,
      description: `Completed diagnosis — Top result: ${session.predictions[0]?.disease_name || 'Unknown'} (${Math.round((session.predictions[0]?.probability || 0) * 100)}%)`,
      timestamp: new Date(session.timestamp),
      metadata: { disease: session.predictions[0]?.disease_name, symptoms: session.checkedSymptoms.length },
    },
    ...(session.followUpHistory.length > 0
      ? [{
          id: `${session.id}-followup`,
          type: 'followup' as ActivityType,
          description: `Follow-up conversation: ${session.followUpHistory.length} messages`,
          timestamp: new Date(session.timestamp),
        }]
      : []),
  ]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <AppShell title="Activity Log" subtitle="Complete audit trail of your AI interactions">
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: 'Total Events', value: activities.length },
            { label: 'Sessions', value: sessions.length },
            { label: 'Follow-ups', value: sessions.filter((s) => s.followUpHistory.length > 0).length },
          ].map((stat, i) => (
            <div key={stat.label} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-3 text-center">
              <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Activity timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--text-muted)]" />
              <p className="font-semibold text-[var(--text-primary)]">Recent Activity</p>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <Activity size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs mt-1">Your actions will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {activities.map((activity, i) => {
                const config = TYPE_ICONS[activity.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--bg-glass)] transition-colors"
                  >
                    <div className={cn('p-2 rounded-xl flex-shrink-0 mt-0.5', config.bg)}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.metadata && (
                        <div className="flex gap-2 mt-1.5">
                          {activity.metadata.symptoms && (
                            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)]">
                              {activity.metadata.symptoms} symptoms
                            </span>
                          )}
                          {activity.metadata.disease && (
                            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                              {activity.metadata.disease.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[0.65rem] text-[var(--text-muted)] flex-shrink-0 mt-0.5">
                      {formatDate(new Date(activity.timestamp))}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
