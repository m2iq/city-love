'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Heart, Download } from 'lucide-react';

interface ColoredQRProps {
  url: string;
  heartColor: string;
  size?: number;
}

export default function ColoredQR({ url, heartColor, size = 180 }: ColoredQRProps) {
  const bgAlpha = '12';
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const padding = 24;
    const totalSize = size + padding * 2;
    const canvas = document.createElement('canvas');
    canvas.width = totalSize;
    canvas.height = totalSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background with subtle gradient
    const grad = ctx.createLinearGradient(0, 0, totalSize, totalSize);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(1, '#151525');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, totalSize, totalSize, 16);
    ctx.fill();

    // Serialize SVG and draw
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      URL.revokeObjectURL(svgUrl);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `رسالة-حب-qr.png`;
      a.click();
    };
    img.src = svgUrl;
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-white/30 text-[11px] tracking-[0.2em] uppercase">امسح للفتح</p>

      {/* Outer glow ring */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 32px ${heartColor}50, 0 0 8px ${heartColor}30`,
            borderRadius: 16,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* QR card */}
        <div
          className="relative rounded-2xl p-4 border"
          style={{
            background: `linear-gradient(135deg, ${heartColor}${bgAlpha} 0%, #0d0d1a 100%)`,
            borderColor: `${heartColor}30`,
          }}
        >
          {/* Corner accents */}
          {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
            <span
              key={i}
              className={`absolute ${pos} w-3 h-3`}
              style={{
                borderColor: heartColor,
                borderWidth: 2,
                borderRadius: 3,
                borderStyle: 'solid',
                borderRight: i % 2 === 0 ? 'none' : undefined,
                borderLeft: i % 2 !== 0 ? 'none' : undefined,
                borderBottom: i < 2 ? 'none' : undefined,
                borderTop: i >= 2 ? 'none' : undefined,
              }}
            />
          ))}

          {/* QR Code */}
          <div className="relative" ref={qrRef}>
            <QRCodeSVG
              value={url}
              size={size}
              fgColor={heartColor}
              bgColor="transparent"
              level="M"
              imageSettings={{
                src: '',
                width: 0,
                height: 0,
                excavate: false,
              }}
            />

            {/* Heart overlay in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="rounded-full p-1.5"
                style={{ background: '#0d0d1a', border: `1.5px solid ${heartColor}40` }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart
                  className="w-4 h-4"
                  fill={heartColor}
                  color={heartColor}
                  style={{ filter: `drop-shadow(0 0 6px ${heartColor})` }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <motion.button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all"
        style={{
          color: `${heartColor}cc`,
          borderColor: `${heartColor}30`,
          background: `${heartColor}0d`,
        }}
        whileHover={{ scale: 1.05, borderColor: `${heartColor}60` }}
        whileTap={{ scale: 0.97 }}
      >
        <Download className="w-3 h-3" />
        تحميل الباركود
      </motion.button>
    </motion.div>
  );
}
