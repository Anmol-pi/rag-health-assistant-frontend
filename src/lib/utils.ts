import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export function getRiskLevel(probability: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (probability >= 0.7) return { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  if (probability >= 0.4) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
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
