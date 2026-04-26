import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null, unknown: boolean) {
  if (unknown || !dateStr) return 'Unknown';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid Date';
  }
}
