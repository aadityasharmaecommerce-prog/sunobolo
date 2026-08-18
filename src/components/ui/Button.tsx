import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  (
    | ({ to: string } & Omit<ButtonHTMLAttributes<HTMLAnchorElement>, 'className'>)
    | ({ to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if ('to' in rest && rest.to) {
    const { to, ...anchorRest } = rest;
    return (
      <Link to={to} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
