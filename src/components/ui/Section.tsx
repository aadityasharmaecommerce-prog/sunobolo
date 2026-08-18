import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, subtitle, align = 'center', children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      <div className={`section__head section__head--${align}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="section__title">{title}</h2>}
        {subtitle && <p className="section__subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
