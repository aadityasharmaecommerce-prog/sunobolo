/**
 * SunoBolo — Premium Course Icon Tiles
 * Each course gets a unique, visually rich icon with gradient background.
 */
import {
  Sprout, BarChart3, Target, Home, Briefcase, Building2,
  TrendingUp, Plane, Baby, GraduationCap, Sparkles
} from 'lucide-react';

const COURSE_STYLES: Record<string, {
  gradient: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  glow: string;
}> = {
  'beginner': {
    gradient: 'from-emerald-400 to-teal-500',
    icon: Sprout,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(52,211,153,0.5)]',
  },
  'intermediate': {
    gradient: 'from-blue-400 to-indigo-500',
    icon: BarChart3,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)]',
  },
  'advanced': {
    gradient: 'from-purple-400 to-violet-600',
    icon: Target,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(139,92,246,0.5)]',
  },
  'daily-life': {
    gradient: 'from-amber-400 to-orange-500',
    icon: Home,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(251,191,36,0.5)]',
  },
  'business': {
    gradient: 'from-sky-400 to-blue-600',
    icon: TrendingUp,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(56,189,248,0.5)]',
  },
  'corporate': {
    gradient: 'from-slate-500 to-gray-700',
    icon: Building2,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(100,116,139,0.5)]',
  },
  'interview': {
    gradient: 'from-rose-400 to-pink-600',
    icon: Briefcase,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(251,113,133,0.5)]',
  },
  'kids': {
    gradient: 'from-pink-400 to-fuchsia-500',
    icon: Baby,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(244,114,182,0.5)]',
  },
  'school': {
    gradient: 'from-indigo-400 to-blue-600',
    icon: GraduationCap,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(129,140,248,0.5)]',
  },
  'travel': {
    gradient: 'from-cyan-400 to-teal-500',
    icon: Plane,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px~-4px_rgba(34,211,238,0.5)]',
  },
  'free-trial': {
    gradient: 'from-brand-400 to-accent-500',
    icon: Sparkles,
    iconColor: 'text-white',
    glow: 'shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)]',
  },
};

const DEFAULT_STYLE = {
  gradient: 'from-brand-400 to-accent-500',
  icon: Sparkles,
  iconColor: 'text-white',
  glow: 'shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)]',
};

export default function CourseIcon({ courseId, size = 'md' }: {
  courseId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const style = COURSE_STYLES[courseId] || DEFAULT_STYLE;
  const Icon = style.icon;
  
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };
  
  const iconSizes = { sm: 18, md: 22, lg: 28 };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${style.gradient} flex items-center justify-center shrink-0 ${style.glow} transition-transform`}>
      <Icon size={iconSizes[size]} className={style.iconColor} strokeWidth={2} />
    </div>
  );
}
