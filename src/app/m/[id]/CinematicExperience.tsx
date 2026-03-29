'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Heart, SkipForward } from 'lucide-react';
import type { Message } from '@/lib/supabase';
import { provinces } from '@/lib/provinces';

const IraqMap = dynamic(() => import('@/components/IraqMap'), { ssr: false });
const FloatingHearts = dynamic(() => import('@/components/FloatingHearts'), { ssr: false });
const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });
const EnvelopeReveal = dynamic(() => import('@/components/EnvelopeReveal'), { ssr: false });
const LetterReveal = dynamic(() => import('@/components/LetterReveal'), { ssr: false });

type Phase =
  | 'dark-intro'
  | 'map-appear'
  | 'sender-glow'
  | 'traveling'
  | 'delivery'
  | 'envelope-reveal'
  | 'message-reveal';

const PHASES: Phase[] = [
  'dark-intro',
  'map-appear',
  'sender-glow',
  'traveling',
  'delivery',
  'envelope-reveal',
  'message-reveal',
];

const phaseTimings: Record<Phase, number> = {
  'dark-intro': 2400,
  'map-appear': 1800,
  'sender-glow': 2200,
  traveling: 6800,
  delivery: 3000,
  'envelope-reveal': 0,
  'message-reveal': 0,
};



interface CinematicExperienceProps {
  message: Message;
}

export default function CinematicExperience({ message }: CinematicExperienceProps) {
  const [phase, setPhase] = useState<Phase>('dark-intro');
  const [heartsCount, setHeartsCount] = useState(message.hearts_count);
  const [hearting, setHearting] = useState(false);
  const [giftEmerged, setGiftEmerged] = useState(false);
  const [travelProgress, setTravelProgress] = useState(0);
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const deviceMemory = 'deviceMemory' in navigator ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8 : 8;
    const hardwareConcurrency = navigator.hardwareConcurrency || 8;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 900;

    setLowPerformanceMode(
      media.matches
      || coarsePointer
      || isSmallScreen
      || deviceMemory <= 4
      || hardwareConcurrency <= 4,
    );

    const handlePreferenceChange = () => {
      const updatedCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const updatedSmallScreen = window.innerWidth < 900;
      setLowPerformanceMode(
        media.matches
        || updatedCoarsePointer
        || updatedSmallScreen
        || deviceMemory <= 4
        || hardwareConcurrency <= 4,
      );
    };

    media.addEventListener('change', handlePreferenceChange);
    window.addEventListener('resize', handlePreferenceChange);

    return () => {
      media.removeEventListener('change', handlePreferenceChange);
      window.removeEventListener('resize', handlePreferenceChange);
    };
  }, []);

  const sender = provinces[message.sender_province];
  const receiver = provinces[message.receiver_province];
  const heartColor = message.heart_color || '#ff2d55';
  const particleCount = lowPerformanceMode ? 5 : 18;
  const floatingHeartsCount = lowPerformanceMode ? 0 : 6;

  const phaseIndex = PHASES.indexOf(phase);

  /* Phase auto-progression */
  useEffect(() => {
    const timing = phaseTimings[phase];
    if (timing === 0) return;
    const timer = setTimeout(() => {
      const idx = PHASES.indexOf(phase);
      if (idx < PHASES.length - 1) setPhase(PHASES[idx + 1]);
    }, timing);
    return () => clearTimeout(timer);
  }, [phase]);

  /* Delayed gift emergence during delivery */
  useEffect(() => {
    if (phase === 'delivery') {
      const timer = setTimeout(() => setGiftEmerged(true), 600);
      return () => clearTimeout(timer);
    }
    if (phase !== 'envelope-reveal') setGiftEmerged(false);
  }, [phase]);

  useEffect(() => {
    if (phase === 'sender-glow') {
      setTravelProgress(0);
      return;
    }

    if (phase === 'delivery' || phase === 'envelope-reveal' || phase === 'message-reveal') {
      setTravelProgress(1);
      return;
    }

    if (phase !== 'traveling') {
      return;
    }

    let frameId = 0;
    const duration = 6200;
    const start = performance.now();
    const minFrameGap = lowPerformanceMode ? 1000 / 18 : 1000 / 30;
    let lastCommittedAt = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const normalized = Math.min(elapsed / duration, 1);
      // Smooth ease-in-out (cubic bezier feel)
      const eased = normalized < 0.5
        ? 4 * normalized * normalized * normalized
        : 1 - Math.pow(-2 * normalized + 2, 3) / 2;

      if (now - lastCommittedAt >= minFrameGap || normalized >= 1) {
        lastCommittedAt = now;
        setTravelProgress(eased);
      }

      if (normalized < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    setTravelProgress(0);
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [lowPerformanceMode, phase]);

  const handleHeart = useCallback(async () => {
    if (hearting) return;
    setHearting(true);
    setHeartsCount((c) => c + 1);
    try {
      await fetch(`/api/messages/${message.slug}/hearts`, { method: 'POST' });
    } catch {
      /* optimistic */
    } finally {
      setHearting(false);
    }
  }, [hearting, message.slug]);

  const skipToReveal = () => setPhase('message-reveal');
  const replaySequence = () => {
    setGiftEmerged(false);
    setPhase('dark-intro');
  };
  const handleEnvelopeOpened = useCallback(() => setPhase('message-reveal'), []);

  const mapVisible = phaseIndex >= 1 && phaseIndex <= 4;
  const isTraveling = phase === 'traveling';
  const isDelivery = phase === 'delivery';
  const mapBlurFilter = lowPerformanceMode
    ? (isDelivery ? 'brightness(0.55)' : 'brightness(1)')
    : (isDelivery ? 'blur(8px) brightness(0.2)' : 'blur(0px) brightness(1)');
  const showAmbientParticles = phaseIndex >= 1 && particleCount > 0;
  const showFloatingHearts = phaseIndex >= 3 && floatingHeartsCount > 0;

  return (
    <main className="relative min-h-dvh overflow-hidden cinematic-bg">
      {/* Deep animated gradient background */}
      <div className={`cinematic-bg-layer${lowPerformanceMode ? ' cinematic-bg-layer-lite' : ''}`} />

      {/* Subtle light rays */}
      {!lowPerformanceMode && <div className="cinematic-light-rays" />}

      {/* Cinematic vignette */}
      <div className="cinematic-vignette fixed inset-0 z-1 pointer-events-none" />

      {/* Ambient particles */}
      {showAmbientParticles && <ParticleField color={heartColor} count={particleCount} />}
      {showFloatingHearts && <FloatingHearts count={floatingHeartsCount} color={heartColor} />}

      {/* ═══ Phase 1: Dark Intro ═══ */}
      <AnimatePresence>
        {phase === 'dark-intro' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <div className="text-center space-y-5 px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Heart
                  className="w-12 h-12 sm:w-14 sm:h-14 mx-auto"
                  fill={heartColor}
                  color={heartColor}
                  style={{ filter: `drop-shadow(0 0 32px ${heartColor}90)` }}
                />
              </motion.div>
              <motion.p
                className="text-white/30 text-[11px] sm:text-xs tracking-[0.22em] font-light"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.9 }}
              >
                هناك رسالة حب في الطريق إليك
              </motion.p>
              <motion.div
                className="flex items-center justify-center gap-3 pt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                <span className="text-white/20 text-[10px] tracking-widest">{sender?.nameAr}</span>
                <span className="text-white/15 text-[10px]">←</span>
                <span className="text-white/20 text-[10px] tracking-widest">{receiver?.nameAr}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Map Sequence (map-appear → sender-glow → traveling → delivery) ═══ */}
      <AnimatePresence>
        {mapVisible && (
          <motion.div
            className={`fixed inset-0${isDelivery && !lowPerformanceMode ? ' camera-shake' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.94, filter: 'blur(12px)' }}
            transition={{ duration: 0.9 }}
          >
            {/* Cinematic letterbox bars */}
            <div className="fixed inset-x-0 top-0 z-8 h-[8vh] bg-black pointer-events-none" />
            <div className="fixed inset-x-0 bottom-0 z-8 h-[8vh] bg-black pointer-events-none" />

            <div className="relative w-full h-full">
              {/* Status text — floating above the map */}
              <AnimatePresence mode="wait">
                {phaseIndex >= 1 && phaseIndex <= 3 && (
                  <motion.div
                    className="absolute top-[10vh] inset-x-0 z-10 text-center pointer-events-none"
                    key={phase}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.55 }}
                  >
                    {phase === 'map-appear' && (
                      <p className="text-white/40 text-sm sm:text-base tracking-[0.22em] font-light uppercase">
                        خريطة العراق
                      </p>
                    )}
                    {phase === 'sender-glow' && (
                      <>
                        <p className="text-white/30 text-[11px] tracking-[0.25em] mb-1">تنطلق من</p>
                        <p
                          className="text-lg sm:text-2xl font-bold tracking-wide"
                          style={{ color: heartColor, textShadow: `0 0 20px ${heartColor}80` }}
                        >
                          {sender?.nameAr}
                        </p>
                      </>
                    )}
                    {phase === 'traveling' && (
                      <>
                        <p className="text-white/25 text-[11px] tracking-[0.22em] mb-2">في الطريق إلى</p>
                        <p
                          className="text-base sm:text-xl font-bold tracking-wide"
                          style={{ color: '#ffd76a', textShadow: '0 0 18px #ffd76a60' }}
                        >
                          {receiver?.nameAr}
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Iraq map — full screen, cinematic camera enabled */}
              <motion.div
                className="absolute inset-0"
                animate={{ filter: mapBlurFilter }}
                transition={{ duration: lowPerformanceMode ? 0.5 : 1.4, ease: 'easeInOut' }}
              >
                <IraqMap
                  senderProvince={
                    phaseIndex >= 2 ? message.sender_province : undefined
                  }
                  receiverProvince={
                    phaseIndex >= 3 ? message.receiver_province : undefined
                  }
                  highlightedProvince={phase === 'sender-glow' ? message.sender_province : phaseIndex >= 3 ? message.receiver_province : undefined}
                  showPath={phase === 'traveling' || phase === 'delivery'}
                  travelProgress={travelProgress}
                  heartColor={heartColor}
                  cinematicCamera={!lowPerformanceMode}
                  lowPerformance={lowPerformanceMode}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Gift emergence — standalone, always above map ═══ */}
      <AnimatePresence>
        {giftEmerged && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dark backdrop to focus on gift */}
            <motion.div
              className="fixed inset-0 bg-black/80 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Screen flash on emergence */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-22"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.8, times: [0, 0.1, 1], ease: 'easeOut' }}
              style={{ background: `radial-gradient(circle at 50% 50%, white 0%, ${heartColor}88 35%, transparent 65%)` }}
            />

            {/* Ambient glow */}
            <motion.div
              className="fixed inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${heartColor}20 0%, transparent 50%)` }}
              animate={{ opacity: lowPerformanceMode ? 0.35 : [0.3, 0.7, 0.3] }}
              transition={lowPerformanceMode ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Spotlight */}
            {!lowPerformanceMode && <div className="spotlight-cone" />}
            {!lowPerformanceMode && <div className="spotlight-source" />}

            {/* Shockwave rings */}
            {Array.from({ length: lowPerformanceMode ? 1 : 3 }).map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="fixed pointer-events-none rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: 60,
                  height: 60,
                  marginLeft: -30,
                  marginTop: -30,
                  border: `2px solid ${i % 2 === 0 ? '#ffd700' : heartColor}`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 7 + i * 2, opacity: 0 }}
                transition={{ delay: 0.1 + i * 0.15, duration: 1.4, ease: 'easeOut' }}
              />
            ))}

            {/* Delivery text */}
            <AnimatePresence>
              {phase === 'delivery' && (
                <motion.p
                  key="envelope-label"
                  className="absolute z-20 text-white/50 text-xs sm:text-sm tracking-[0.2em] font-light pointer-events-none"
                  style={{ top: 'calc(50% - 200px)' }}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                >
                  وصلتك رسالة...
                </motion.p>
              )}
            </AnimatePresence>

            {/* Envelope reveal */}
            <div className="relative z-10" style={{ transform: 'translateX(-8px)' }}>
              <motion.div
                initial={{ scale: 0.05, opacity: 0, filter: 'brightness(4) blur(16px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'brightness(1) blur(0px)' }}
                transition={{
                  scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.35 },
                  filter: { duration: 1, delay: 0.15 },
                }}
              >
                <EnvelopeReveal
                  heartColor={heartColor}
                  onOpened={handleEnvelopeOpened}
                  senderName={message.sender_name}
                  receiverName={message.receiver_name}
                />
              </motion.div>
            </div>

            {/* Particle burst */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              const dist = 70 + (i % 5) * 20;
              return (
                <motion.div
                  key={`emerge-${i}`}
                  className="fixed rounded-full pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: 3 + (i % 3),
                    height: 3 + (i % 3),
                    background: i % 4 === 0 ? '#ffd700' : i % 3 === 0 ? '#fff' : heartColor,
                    boxShadow: `0 0 ${4 + (i % 4)}px ${i % 4 === 0 ? '#ffd700' : heartColor}`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
                  transition={{ delay: 0.05 + i * 0.02, duration: 1.5, ease: 'easeOut' }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Message Reveal (Letter) ═══ */}
      <AnimatePresence>
        {phase === 'message-reveal' && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <div className="absolute inset-0 romantic-gradient-warm" />
            <div className="cinematic-bg-layer" />
            <div className="cinematic-vignette" />

            {/* Warm ambient glow */}
            <motion.div
              className="fixed inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 40%, ${heartColor}10 0%, transparent 50%)`,
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Light streaks */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`streak-msg-${i}`}
                className="fixed pointer-events-none"
                style={{
                  width: '1.5px',
                  height: '50px',
                  background: `linear-gradient(180deg, transparent 0%, ${heartColor}18 50%, transparent 100%)`,
                  left: `${25 + i * 25}%`,
                  top: '-50px',
                  transform: `rotate(${10 + i * 5}deg)`,
                }}
                animate={{
                  y: ['0vh', '120vh'],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 4 + i * 0.6,
                  delay: i * 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            <FloatingHearts count={6} color={heartColor} />

            <LetterReveal
              heartColor={heartColor}
              senderName={message.sender_name}
              receiverName={message.receiver_name}
              senderCity={sender?.nameAr}
              receiverCity={receiver?.nameAr}
              messageText={message.message}
              heartsCount={heartsCount}
              hearting={hearting}
              slug={message.slug}
              onHeart={handleHeart}
              onReplay={replaySequence}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Skip button ═══ */}
      {phaseIndex > 0 && phaseIndex < PHASES.length - 1 && (
        <motion.button
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center gap-1.5 text-white/15 hover:text-white/40 text-[11px] sm:text-xs transition-colors glass rounded-full px-3 py-1.5 sm:px-4 sm:py-2"
          onClick={skipToReveal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <SkipForward className="w-3 h-3" />
          تخطَّ
        </motion.button>
      )}
    </main>
  );
}
