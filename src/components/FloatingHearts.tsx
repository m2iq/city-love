'use client';

import { useEffect, useRef } from 'react';

interface FloatingHeartsProps {
  count?: number;
  color?: string;
}

// Lightweight CSS/Canvas floating hearts (no Three.js)
export default function FloatingHearts({ count = 20, color = '#ff2d55' }: FloatingHeartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Heart {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const hearts: Heart[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      size: 6 + Math.random() * 14,
      speed: 0.3 + Math.random() * 0.8,
      opacity: 0.1 + Math.random() * 0.4,
      wobble: 0,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
    }));

    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;

      // Outer glow
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity * 0.15;
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.3);
      ctx.bezierCurveTo(-size * 0.6, -size * 1.1, -size * 1.1, -size * 0.4, 0, size * 0.6);
      ctx.bezierCurveTo(size * 1.1, -size * 0.4, size * 0.6, -size * 1.1, 0, -size * 0.3);
      ctx.closePath();
      ctx.fill();

      // Main heart
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.3);
      ctx.bezierCurveTo(-size * 0.5, -size, -size, -size * 0.4, 0, size * 0.5);
      ctx.bezierCurveTo(size, -size * 0.4, size * 0.5, -size, 0, -size * 0.3);
      ctx.closePath();
      ctx.fill();

      // Inner highlight
      ctx.globalAlpha = opacity * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-size * 0.22, -size * 0.45, size * 0.12, size * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      hearts.forEach((h) => {
        h.y -= h.speed;
        h.wobble += h.wobbleSpeed * 0.02;
        const wx = Math.sin(h.wobble) * 30;

        if (h.y < -50) {
          h.y = window.innerHeight + 50;
          h.x = Math.random() * window.innerWidth;
        }

        drawHeart(h.x + wx, h.y, h.size, h.opacity);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
