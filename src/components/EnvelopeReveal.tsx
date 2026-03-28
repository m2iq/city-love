'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

interface EnvelopeRevealProps {
  heartColor?: string;
  onOpened?: () => void;
  senderName: string;
  receiverName: string;
}

export default function EnvelopeReveal({
  heartColor = '#ff2d55',
  onOpened,
  senderName,
  receiverName,
}: EnvelopeRevealProps) {
  const [state, setState] = useState<'rising' | 'idle' | 'opening' | 'letter-out'>('rising');

  const particlesRef = useRef<Array<{ angle: number; dist: number; size: number }>>([]);

  useEffect(() => {
    particlesRef.current = Array.from({ length: 20 }, (_, i) => ({
      angle: (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
      dist: 50 + Math.random() * 70,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  const handleRisingComplete = useCallback(() => {
    setState('idle');
  }, []);

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;
    setState('opening');
    setTimeout(() => {
      setState('letter-out');
      setTimeout(() => onOpened?.(), 1200);
    }, 1200);
  }, [state, onOpened]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Tap hint */}
      <AnimatePresence>
        {state === 'idle' && (
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Mail className="w-5 h-5 mx-auto text-white/30" />
            </motion.div>
            <p className="text-white/25 text-xs tracking-[0.18em] font-light">
              اضغط على الرسالة لقراءتها
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Envelope scene */}
      <motion.div
        className="envelope-scene"
        onClick={handleClick}
        style={{
          cursor: state === 'idle' ? 'pointer' : 'default',
          perspective: '1000px',
        }}
        initial={{ y: 120, opacity: 0, scale: 0.4, filter: 'brightness(2) blur(6px)' }}
        animate={{ y: 0, opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' }}
        transition={{
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
          filter: { duration: 1.2, delay: 0.6 },
        }}
        onAnimationComplete={handleRisingComplete}
      >
        {/* Envelope shadow */}
        <motion.div
          className="envelope-shadow"
          animate={{
            opacity: state === 'opening' || state === 'letter-out' ? 0.5 : [0.2, 0.35, 0.2],
            scale: state === 'letter-out' ? 1.3 : 1,
          }}
          transition={{
            duration: state === 'idle' ? 3 : 0.8,
            repeat: state === 'idle' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        {/* 3D Envelope wrapper with tilt */}
        <motion.div
          className="envelope-3d-wrapper"
          animate={
            state === 'idle'
              ? { rotateX: -10, rotateY: [0, 3, 0, -3, 0], y: [0, -6, 0] }
              : state === 'opening'
                ? { rotateX: -6, rotateY: 0, y: 0 }
                : { rotateX: 0, rotateY: 0, y: 0 }
          }
          transition={
            state === 'idle'
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Envelope body */}
          <div className="envelope-body" style={{ borderColor: `${heartColor}25` }}>
            {/* Paper texture overlay */}
            <div className="envelope-texture" />

            {/* Envelope inner fold shadows */}
            <div className="envelope-inner-fold-left" />
            <div className="envelope-inner-fold-right" />

            {/* Names on envelope */}
            <div className="envelope-content">
              <p className="text-[10px] tracking-[0.15em] opacity-40 mb-1">إلى</p>
              <p className="text-base font-serif font-bold opacity-70">{receiverName}</p>
              <div
                className="w-12 h-px mx-auto my-2 opacity-20"
                style={{ backgroundColor: heartColor }}
              />
              <p className="text-[9px] tracking-[0.12em] opacity-30">من {senderName}</p>
            </div>

            {/* Wax seal */}
            <div className="envelope-seal" style={{ backgroundColor: heartColor }}>
              <div className="envelope-seal-inner" style={{ borderColor: `${heartColor}80` }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3 opacity-80">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            {/* Flap (triangle) */}
            <motion.div
              className="envelope-flap"
              style={{
                transformOrigin: 'top center',
                borderTopColor: '#dbd0c4',
              }}
              animate={
                state === 'opening' || state === 'letter-out'
                  ? { rotateX: 180 }
                  : { rotateX: 0 }
              }
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Flap texture */}
              <div className="envelope-flap-texture" />
            </motion.div>

            {/* Letter sliding out */}
            <AnimatePresence>
              {state === 'letter-out' && (
                <motion.div
                  className="envelope-letter-preview"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -120, opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="letter-preview-lines">
                    <div className="letter-preview-line" style={{ width: '60%' }} />
                    <div className="letter-preview-line" style={{ width: '80%' }} />
                    <div className="letter-preview-line" style={{ width: '45%' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Light particles around envelope */}
        <AnimatePresence>
          {(state === 'opening' || state === 'letter-out') && (
            <>
              {particlesRef.current.map((p, i) => (
                <motion.div
                  key={`env-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: p.size,
                    height: p.size,
                    background: i % 2 === 0 ? '#ffd700' : heartColor,
                    boxShadow: `0 0 ${p.size * 2}px ${i % 2 === 0 ? '#ffd700' : heartColor}`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.dist,
                    y: Math.sin(p.angle) * p.dist,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    delay: 0.15 + i * 0.03,
                    duration: 1.5,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Seal break flash */}
              <motion.div
                className="absolute left-1/2 bottom-[20%] -translate-x-1/2 rounded-full pointer-events-none"
                style={{
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(circle, ${heartColor}50 0%, #ffd70025 40%, transparent 70%)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2.5, 3.5], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Ambient shimmer when idle */}
        <AnimatePresence>
          {state === 'idle' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 40%, ${heartColor}08 0%, transparent 60%)`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
