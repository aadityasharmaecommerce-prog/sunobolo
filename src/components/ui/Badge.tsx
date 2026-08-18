import type { ReactNode } from 'react';

type BadgeVariant = 'free' | 'paid' | 'locked' | 'done' | 'info' | 'warn' | 'danger' | 'neutral';

const VARIANT_LABEL: Record<BadgeVariant, string> = {
  free: 'free',
  paid: 'paid',
  locked: 'locked',
  done: 'done',
  info: 'info',
  warn: 'warn',
  danger: 'danger',
  neutral: 'neutral',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge--${VARIANT_LABEL[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
