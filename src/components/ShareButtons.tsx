'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  slug: string;
}

export default function ShareButtons({ slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/m/${slug}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'رسالة حب من أجلك',
          text: 'هناك من أرسل لك رسالة رومانسية تعبر خريطة العراق.',
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <motion.button
        onClick={handleCopy}
        className="flex-1 glass-card rounded-2xl px-5 py-3.5 text-white/70 hover:text-white hover:bg-white/8 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm font-medium"
        whileTap={{ scale: 0.97 }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-green-400"
            >
              <Check className="w-4 h-4" />
              تم النسخ
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              نسخ الرابط
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.button
        onClick={handleShare}
        className="flex-1 bg-gradient-to-r from-romantic-500 to-romantic-600 rounded-2xl px-5 py-3.5 text-white font-semibold shadow-lg shadow-romantic-500/20 hover:shadow-romantic-500/35 hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm"
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
      >
        <Share2 className="w-4 h-4" />
        مشاركة الرسالة
      </motion.button>
    </div>
  );
}
