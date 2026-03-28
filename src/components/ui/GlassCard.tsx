'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  delay = 0,
  hover = false,
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card rounded-2xl p-6 ${hover ? 'transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(255,45,101,0.08)]' : ''} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
