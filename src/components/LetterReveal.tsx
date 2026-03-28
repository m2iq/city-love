'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, PenLine } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';

interface LetterRevealProps {
  heartColor: string;
  senderName: string;
  receiverName: string;
  senderCity?: string;
  receiverCity?: string;
  messageText: string;
  heartsCount: number;
  hearting: boolean;
  slug: string;
  onHeart: () => void;
  onReplay: () => void;
}

export default function LetterReveal({
  heartColor,
  senderName,
  receiverName,
  senderCity,
  receiverCity,
  messageText,
  heartsCount,
  hearting,
  slug,
  onHeart,
  onReplay,
}: LetterRevealProps) {
  const [unfolded, setUnfolded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setUnfolded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{ perspective: '1200px' }}
      className="relative z-10 w-full max-w-lg mx-auto"
    >
      {/* Unfolding container */}
      <motion.div
        initial={{ opacity: 0, rotateX: 45, y: 120, scale: 0.7, filter: 'brightness(1.5) blur(4px)' }}
        animate={{
          opacity: 1,
          rotateX: unfolded ? 0 : 15,
          y: 0,
          scale: 1,
          filter: 'brightness(1) blur(0px)',
        }}
        transition={{
          delay: 0.1,
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1],
          filter: { duration: 1.2, delay: 0.3 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="space-y-6"
      >
        {/* Letter card */}
        <div className="letter-paper">
          {/* Paper texture overlay */}
          <div className="letter-texture" />

          {/* Fold lines */}
          <motion.div
            className="letter-fold-line"
            style={{ top: '33%' }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: unfolded ? 0.06 : 0.3 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <motion.div
            className="letter-fold-line"
            style={{ top: '66%' }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: unfolded ? 0.06 : 0.3 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />

          {/* Decorative header line */}
          <motion.div
            className="letter-header-ornament"
            style={{ borderColor: `${heartColor}30` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Header text */}
          <motion.div
            className="text-center pt-2 pb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="letter-label">رسالة حب</p>
          </motion.div>

          {/* From → To */}
          <motion.div
            className="text-center space-y-4 py-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
          >
            <div className="space-y-0.5">
              <p className="letter-label">من</p>
              <p
                className="text-xl md:text-2xl font-serif font-bold"
                style={{ color: heartColor }}
              >
                {senderName}
              </p>
              {senderCity && (
                <p className="text-xs opacity-30 font-light">{senderCity}، العراق</p>
              )}
            </div>

            {/* Arrow divider */}
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1 }}
            >
              <div
                className="w-16 h-px opacity-15"
                style={{ backgroundColor: heartColor }}
              />
              <Heart
                className="w-3.5 h-3.5 opacity-25"
                fill={heartColor}
                color={heartColor}
              />
              <div
                className="w-16 h-px opacity-15"
                style={{ backgroundColor: heartColor }}
              />
            </motion.div>

            <div className="space-y-0.5">
              <p className="letter-label">إلى</p>
              <p className="text-xl md:text-2xl font-serif font-bold letter-receiver-name">
                {receiverName}
              </p>
              {receiverCity && (
                <p className="text-xs opacity-30 font-light">{receiverCity}، العراق</p>
              )}
            </div>
          </motion.div>

          {/* Ornamental divider */}
          <motion.div
            className="flex items-center gap-4 px-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-800/15 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-800/15" />
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-800/15 to-transparent" />
          </motion.div>

          {/* The message */}
          <motion.blockquote
            className="text-center px-4 md:px-8 py-6"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.2, duration: 1.2 }}
          >
            <p className="letter-message-text">
              &ldquo;{messageText}&rdquo;
            </p>
          </motion.blockquote>

          {/* Bottom ornament */}
          <motion.div
            className="letter-footer-ornament"
            style={{ borderColor: `${heartColor}20` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />

          {/* Pulsing heart at bottom */}
          <motion.div
            className="text-center py-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.08, 1] }}
            transition={{ delay: 1.6, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart
              className="w-8 h-8 mx-auto"
              fill={heartColor}
              color={heartColor}
              style={{ filter: `drop-shadow(0 0 12px ${heartColor}40)` }}
            />
          </motion.div>
        </div>

        {/* Action buttons - outside the letter */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          {/* Heart + Replay buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <motion.button
              onClick={onHeart}
              className="inline-flex items-center gap-2.5 px-7 py-2.5 rounded-2xl glass hover:bg-white/8 transition-all group"
              whileTap={{ scale: 0.92 }}
              disabled={hearting}
            >
              <motion.div
                animate={hearting ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className="w-4 h-4 transition-colors"
                  fill={heartColor}
                  color={heartColor}
                />
              </motion.div>
              <span className="text-white/50 text-sm">أحببتها</span>
              <span className="text-white/50 text-sm tabular-nums">{heartsCount}</span>
            </motion.button>

            <motion.button
              onClick={onReplay}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass hover:bg-white/8 transition-all"
              whileTap={{ scale: 0.94 }}
            >
              <RotateCcw className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/60">إعادة المشهد</span>
            </motion.button>
          </div>

          {/* Share */}
          <ShareButtons slug={slug} />

          {/* CTA */}
          <div className="text-center">
            <a
              href="/create"
              className="inline-flex items-center gap-1.5 text-white/20 hover:text-white/45 text-xs transition-colors"
            >
              <PenLine className="w-3 h-3" />
              أنشئ رسالتك الخاصة
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
