'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart, PenLine, MapPin, Send, ArrowLeft, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import RomanticButton from '@/components/ui/RomanticButton';

const FloatingHearts = dynamic(() => import('@/components/FloatingHearts'), { ssr: false });
const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Page ── */
export default function HomePage() {
  const howRef = useRef<HTMLDivElement>(null);
  const howInView = useInView(howRef, { once: true, margin: '-80px' });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <main className="relative overflow-hidden">
      <ParticleField color="#ff2d55" count={35} />
      <FloatingHearts count={10} />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Animated heart icon */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-7 h-7 text-romantic-500" fill="currentColor" />
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.2]"
          >
            <span className="bg-linear-to-r from-romantic-400 via-romantic-500 to-gold-400 bg-clip-text text-transparent">
              الحب يسافر
            </span>
            <br />
            <span className="text-white text-glow-soft">عبر العراق.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-white/55 leading-loose max-w-2xl mx-auto"
          >
            أرسل رسالة رومانسية سينمائية من محافظة إلى أخرى،
            ودع المشاعر تعبر الخريطة العراقية في تجربة عربية أنيقة.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/create">
              <RomanticButton size="lg" className="min-w-60">
                أنشئ رسالة حب
                <ArrowLeft className="w-4 h-4 mr-1" />
              </RomanticButton>
            </Link>
            <a
              href="#how-it-works"
              className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
            >
              اكتشف طريقة التجربة
            </a>
          </motion.div>
        </motion.div>

        {/* Soft gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-surface to-transparent pointer-events-none" />
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section
        id="how-it-works"
        ref={howRef}
        className="relative z-10 py-24 md:py-32 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate={howInView ? 'visible' : 'hidden'}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-romantic-400 text-sm font-semibold tracking-widest uppercase mb-3"
            >
              كيف تعمل التجربة
            </motion.p>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white font-serif"
            >
              ثلاث خطوات رقيقة
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            animate={howInView ? 'visible' : 'hidden'}
            variants={stagger}
          >
            {[
              {
                icon: <PenLine className="w-6 h-6" />,
                title: 'اكتب رسالتك',
                desc: 'اختر المحافظة المرسلة والمستلمة ثم اكتب كلماتك بطابع رومانسي واضح وأنيق.',
                step: '01',
              },
              {
                icon: <Send className="w-6 h-6" />,
                title: 'أرسل الرابط',
                desc: 'احصل على رابط خاص وشاركه مع الشخص الذي تريد أن تصله الرسالة.',
                step: '02',
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'شاهد الرحلة',
                desc: 'عند فتح الرابط تظهر رحلة قلب متوهج بين المحافظات على خريطة العراق.',
                step: '03',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                <GlassCard hover className="h-full text-center space-y-4 relative overflow-hidden group">
                  {/* Step number watermark */}
                  <span className="absolute top-3 right-4 text-5xl font-bold text-white/3 group-hover:text-white/6 transition-colors duration-500">
                    {item.step}
                  </span>

                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-romantic-500/10 text-romantic-400 group-hover:bg-romantic-500/20 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white font-serif">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-loose">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA SECTION ═══════ */}
      <section
        ref={ctaRef}
        className="relative z-10 py-24 md:py-32 px-4"
      >
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-romantic-500/20 to-gold-400/20 mb-8"
          >
            <Sparkles className="w-6 h-6 text-gold-400" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight font-serif"
          >
            هل أنت مستعد
            <br />
            <span className="bg-linear-to-r from-romantic-400 to-gold-400 bg-clip-text text-transparent">
              لإرسال بعض الحب؟
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-white/40 max-w-md mx-auto"
          >
            أنشئ رسالتك خلال لحظات، وامنح من تحب تجربة بصرية لا تُنسى.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link href="/create">
              <RomanticButton size="lg" className="min-w-[16.25rem]">
                ابدأ الآن
                <Heart className="w-4 h-4 mr-1" fill="currentColor" />
              </RomanticButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 py-10 text-center border-t border-white/5">
        <p className="text-white/15 text-xs tracking-wide">
          صُنعت هذه التجربة بحب من أجل العراق
        </p>
      </footer>
    </main>
  );
}
