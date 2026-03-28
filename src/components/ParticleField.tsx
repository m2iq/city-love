'use client';

import { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  color?: string;
  count?: number;
}

type IconType = 'heart' | 'star' | 'sparkle' | 'diamond';

// Ambient icon-based particle field using canvas
export default function ParticleField({ color = '#ff2d55', count = 50 }: ParticleFieldProps) {
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const iconTypes: IconType[] = ['heart', 'star', 'sparkle', 'diamond'];

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
      rotation: number;
      rotationSpeed: number;
      icon: IconType;
    }

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 3 + Math.random() * 5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: 0.08 + Math.random() * 0.25,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.4 + Math.random() * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      icon: iconTypes[Math.floor(Math.random() * iconTypes.length)],
    }));

    const drawHeart = (x: number, y: number, s: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.3);
      ctx.bezierCurveTo(x - s * 0.5, y - s, x - s, y - s * 0.4, x, y + s * 0.5);
      ctx.bezierCurveTo(x + s, y - s * 0.4, x + s * 0.5, y - s, x, y - s * 0.3);
      ctx.closePath();
      ctx.fill();
    };

    const drawStar = (x: number, y: number, s: number) => {
      const spikes = 4;
      const outerR = s;
      const innerR = s * 0.4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawSparkle = (x: number, y: number, s: number) => {
      ctx.beginPath();
      // 4-point sparkle
      ctx.moveTo(x, y - s);
      ctx.quadraticCurveTo(x + s * 0.15, y - s * 0.15, x + s, y);
      ctx.quadraticCurveTo(x + s * 0.15, y + s * 0.15, x, y + s);
      ctx.quadraticCurveTo(x - s * 0.15, y + s * 0.15, x - s, y);
      ctx.quadraticCurveTo(x - s * 0.15, y - s * 0.15, x, y - s);
      ctx.closePath();
      ctx.fill();
    };

    const drawDiamond = (x: number, y: number, s: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.6, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s * 0.6, y);
      ctx.closePath();
      ctx.fill();
    };

    const drawIcon = (icon: IconType, x: number, y: number, s: number) => {
      switch (icon) {
        case 'heart': drawHeart(x, y, s); break;
        case 'star': drawStar(x, y, s); break;
        case 'sparkle': drawSparkle(x, y, s); break;
        case 'diamond': drawDiamond(x, y, s); break;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed * 0.02;
        p.rotation += p.rotationSpeed;

        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        const currentOpacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);
        const currentSize = p.size * (0.85 + Math.sin(p.pulse) * 0.15);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = color;
        ctx.globalAlpha = currentOpacity;

        drawIcon(p.icon, 0, 0, currentSize);

        // Soft glow
        ctx.globalAlpha = currentOpacity * 0.1;
        drawIcon(p.icon, 0, 0, currentSize * 2.5);

        ctx.restore();
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [color, count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
