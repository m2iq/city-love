'use client';

import { motion } from 'framer-motion';
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const RomanticInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="block text-sm font-medium text-white/75 pr-1">{label}</label>
      <input
        ref={ref}
        className={`w-full glass rounded-2xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-romantic-500/40 transition-all duration-300 ${
          error ? 'ring-2 ring-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <motion.p
          className="text-red-400 text-xs pl-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
);
RomanticInput.displayName = 'RomanticInput';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const RomanticTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="block text-sm font-medium text-white/75 pr-1">{label}</label>
      <textarea
        ref={ref}
        className={`w-full glass rounded-2xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-romantic-500/40 transition-all duration-300 resize-none ${
          error ? 'ring-2 ring-red-500/50' : ''
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && (
        <motion.p
          className="text-red-400 text-xs pl-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
);
RomanticTextarea.displayName = 'RomanticTextarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const RomanticSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="block text-sm font-medium text-white/75 pr-1">{label}</label>
      <select
        ref={ref}
        className={`w-full glass rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-romantic-500/40 transition-all duration-300 bg-transparent ${
          error ? 'ring-2 ring-red-500/50' : ''
        } ${className}`}
        dir="rtl"
        {...props}
      >
        <option value="" className="bg-[#1a0a2e] text-white">
          اختر...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a0a2e] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.p
          className="text-red-400 text-xs pl-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
);
RomanticSelect.displayName = 'RomanticSelect';
