'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface RomanticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function RomanticButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: RomanticButtonProps) {
  const base =
    'relative overflow-hidden rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-romantic-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a14]';

  const variants = {
    primary:
      'bg-linear-to-r from-romantic-500 to-romantic-600 text-white shadow-lg shadow-romantic-500/20 hover:shadow-romantic-500/35 hover:brightness-110 active:scale-[0.97]',
    secondary:
      'glass-card text-white/90 hover:bg-white/8 active:scale-[0.97]',
    ghost:
      'text-white/60 hover:text-white hover:bg-white/5 active:scale-[0.97]',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled || loading ? 'opacity-50 pointer-events-none' : ''
      }`}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      disabled={disabled || loading}
      {...(props as any)}
    >
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </span>
    </motion.button>
  );
}
