'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LoadingScreenProps {
  show: boolean;
}

export default function LoadingScreen({ show }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <div className="text-center space-y-5">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-10 h-10 mx-auto text-romantic-500" fill="currentColor" style={{ filter: 'drop-shadow(0 0 16px rgba(255,45,85,0.5))' }} />
            </motion.div>
            <motion.p
              className="text-white/30 text-xs tracking-[0.15em]"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              يتم تجهيز الرسالة...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
