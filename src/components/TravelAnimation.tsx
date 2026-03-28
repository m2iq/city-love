'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Province, getCurvedPath } from '@/lib/provinces';

interface TravelAnimationProps {
  sender: Province;
  receiver: Province;
  heartColor?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function TravelAnimation({
  sender,
  receiver,
  heartColor = '#ff2d55',
  onComplete,
  duration = 3.5,
}: TravelAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const heartGroupRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const glowTrailRef = useRef<SVGPathElement>(null);
  const glowTrailWideRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const heartGroup = heartGroupRef.current;
    if (!svg || !heartGroup) return;

    const pathD = getCurvedPath(sender, receiver);

    const motionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    motionPath.setAttribute('d', pathD);
    motionPath.style.visibility = 'hidden';
    svg.appendChild(motionPath);

    const totalLength = motionPath.getTotalLength();
    const tl = gsap.timeline({ onComplete });

    // Setup trail dash animations
    const trails = [trailRef.current, glowTrailRef.current, glowTrailWideRef.current];
    trails.forEach((trail) => {
      if (!trail) return;
      gsap.set(trail, { strokeDasharray: totalLength, strokeDashoffset: totalLength });
      tl.to(trail, { strokeDashoffset: 0, duration, ease: 'power2.inOut' }, 0);
    });

    // Heart travels along path with rotation
    const progress = { value: 0 };
    let prevX = sender.x;
    let prevY = sender.y;

    tl.to(
      progress,
      {
        value: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const point = motionPath.getPointAtLength(progress.value * totalLength);
          const angle = Math.atan2(point.y - prevY, point.x - prevX) * (180 / Math.PI);
          heartGroup.setAttribute(
            'transform',
            `translate(${point.x}, ${point.y}) rotate(${angle + 90})`
          );
          prevX = point.x;
          prevY = point.y;

          // Spawn particles with varied density
          if (particlesRef.current) {
            if (Math.random() > 0.5) {
              spawnParticle(particlesRef.current, point.x, point.y, heartColor, false);
            }
            // Occasional sparkle
            if (Math.random() > 0.85) {
              spawnSparkle(particlesRef.current, point.x, point.y);
            }
          }
        },
      },
      0
    );

    // Pulse the heart during travel
    const heartPath = heartGroup.querySelector('.heart-shape');
    if (heartPath) {
      tl.to(
        heartPath,
        {
          scale: 1.25,
          duration: 0.3,
          repeat: Math.floor(duration / 0.6),
          yoyo: true,
          transformOrigin: 'center center',
          ease: 'sine.inOut',
        },
        0
      );
    }

    // Arrival burst at receiver
    tl.to(
      {},
      {
        duration: 0.01,
        onComplete: () => {
          if (!particlesRef.current) return;
          for (let i = 0; i < 16; i++) {
            spawnParticle(particlesRef.current, receiver.x, receiver.y, heartColor, true);
          }
          for (let i = 0; i < 6; i++) {
            spawnSparkle(particlesRef.current, receiver.x, receiver.y, true);
          }
        },
      },
      duration - 0.1
    );

    return () => {
      tl.kill();
      if (svg.contains(motionPath)) svg.removeChild(motionPath);
    };
  }, [sender, receiver, duration, heartColor, onComplete]);

  const curvedPath = getCurvedPath(sender, receiver);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 750"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <filter id="travel-heart-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="trail-bloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="travelTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={heartColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="100%" stopColor={heartColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Widest glow layer */}
      <path
        ref={glowTrailWideRef}
        d={curvedPath}
        fill="none"
        stroke={heartColor}
        strokeWidth="20"
        strokeLinecap="round"
        opacity="0.06"
        filter="url(#trail-bloom)"
      />

      {/* Medium glow trail */}
      <path
        ref={glowTrailRef}
        d={curvedPath}
        fill="none"
        stroke={heartColor}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.12"
        filter="url(#travel-heart-glow)"
      />

      {/* Crisp trail */}
      <path
        ref={trailRef}
        d={curvedPath}
        fill="none"
        stroke="url(#travelTrailGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Particle container */}
      <g ref={particlesRef} />

      {/* Traveling heart */}
      <g ref={heartGroupRef} filter="url(#travel-heart-glow)">
        <path
          className="heart-shape"
          d="M0,-9 C-4,-16 -14,-16 -14,-7 C-14,0 0,12 0,12 C0,12 14,0 14,-7 C14,-16 4,-16 0,-9Z"
          fill={heartColor}
        />
        <ellipse cx="-3" cy="-7" rx="3" ry="3.5" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
  );
}

/** Spawn a particle that fades and drifts */
function spawnParticle(
  container: SVGGElement,
  x: number,
  y: number,
  color: string,
  burst = false
) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const size = burst ? 2.5 + Math.random() * 3.5 : 1.2 + Math.random() * 2;
  circle.setAttribute('cx', String(x));
  circle.setAttribute('cy', String(y));
  circle.setAttribute('r', String(size));
  circle.setAttribute('fill', Math.random() > 0.4 ? color : '#fbbf24');
  circle.setAttribute('opacity', '0.9');
  container.appendChild(circle);

  const angle = burst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
  const dist = burst ? 25 + Math.random() * 40 : 10 + Math.random() * 18;

  gsap.to(circle, {
    attr: {
      cx: x + Math.cos(angle) * dist,
      cy: y + Math.sin(angle) * dist,
      r: 0,
    },
    opacity: 0,
    duration: burst ? 0.9 : 0.65,
    ease: 'power2.out',
    onComplete: () => circle.remove(),
  });
}

/** Spawn a tiny bright sparkle dot */
function spawnSparkle(container: SVGGElement, x: number, y: number, burst = false) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const offsetX = (Math.random() - 0.5) * (burst ? 30 : 12);
  const offsetY = (Math.random() - 0.5) * (burst ? 30 : 12);
  circle.setAttribute('cx', String(x + offsetX));
  circle.setAttribute('cy', String(y + offsetY));
  circle.setAttribute('r', '1.5');
  circle.setAttribute('fill', '#fff');
  circle.setAttribute('opacity', '1');
  container.appendChild(circle);

  gsap.to(circle, {
    attr: { r: 0 },
    opacity: 0,
    duration: burst ? 0.6 : 0.4,
    ease: 'power1.out',
    onComplete: () => circle.remove(),
  });
}
