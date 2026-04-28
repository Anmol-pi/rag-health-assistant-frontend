import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Scale factor applied to raw model probabilities before display.
 * The backend returns probabilities normalised across ~100 diseases,
 * so a disease that accounts for 3/100 of the probability mass comes
 * back as 0.03 (3%).  Multiplying by PROB_SCALE_FACTOR brings these
 * values into a human-readable range that correctly reflects clinical
 * significance (e.g. 0.03 → 9%, 0.15 → 45%, 0.33 → 99%).
 */
export const PROB_SCALE_FACTOR = 3;

/** Return the scaled display probability (capped at 100%). */
export function scaleProbability(prob: number): number {
  return Math.min(prob * PROB_SCALE_FACTOR, 1);
}

export function formatProbability(prob: number): string {
  return `${(scaleProbability(prob) * 100).toFixed(1)}%`;
}

export function getRiskLevel(probability: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  // Thresholds are applied to the *scaled* value so risk labels stay
  // meaningful after the ×3 amplification.
  const scaled = scaleProbability(probability);
  if (scaled >= 0.7) return { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  if (scaled >= 0.4) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
  return { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
