import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Accent color token (adds a soft top border). */
  accent?: string;
  interactive?: boolean;
}

export function Card({ children, accent, interactive = false, className = '', ...rest }: CardProps) {
  const classes = ['card', interactive ? 'card--interactive' : '', className].filter(Boolean).join(' ');
  return (
    <div
      className={classes}
      style={accent ? { borderTopColor: `var(--c-${accent})` } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
