'use client';

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Province, provinces, getCurvedPath } from '@/lib/provinces';

const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 750;
const CX = VIEWBOX_WIDTH / 2;
const CY = VIEWBOX_HEIGHT / 2;

interface IraqMapProps {
  highlightedProvince?: string;
  senderProvince?: string;
  receiverProvince?: string;
  showPath?: boolean;
  travelProgress?: number;
  onProvinceClick?: (province: Province) => void;
  className?: string;
  heartColor?: string;
  interactive?: boolean;
  cinematicCamera?: boolean;
}

function hexToRgba(color: string, alpha: number) {
  const normalized = color.replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const red = Number.parseInt(safe.slice(0, 2), 16);
  const green = Number.parseInt(safe.slice(2, 4), 16);
  const blue = Number.parseInt(safe.slice(4, 6), 16);

  if ([red, green, blue].some((value) => Number.isNaN(value))) {
    return `rgba(255, 45, 85, ${alpha})`;
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function provinceFill(
  provinceId: string,
  senderProvince?: string,
  receiverProvince?: string,
  highlightedProvince?: string,
  heartColor = '#ff2d55',
) {
  if (provinceId === senderProvince) return 'url(#provinceSenderGradient)';
  if (provinceId === receiverProvince) return 'url(#provinceReceiverGradient)';
  if (provinceId === highlightedProvince) return 'url(#provinceHighlightGradient)';
  return 'rgba(14, 34, 65, 0.82)';
}

function ProvincePulse({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <>
      <motion.circle
        cx={cx}
        cy={cy}
        r={10}
        fill={hexToRgba(color, 0.16)}
        animate={{ r: [10, 18, 24], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.6}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </>
  );
}

function TravelPath({ sender, receiver, heartColor, progress }: {
  sender: Province;
  receiver: Province;
  heartColor: string;
  progress: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const heartRef = useRef<SVGGElement>(null);
  const pathData = useMemo(() => getCurvedPath(sender, receiver), [sender, receiver]);

  // All DOM updates in one pass — useLayoutEffect runs before paint (zero visual lag)
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    if (!len) return;
    const clamped = Math.max(0, Math.min(progress, 1));
    const drawn = len * clamped;
    const dashVal = `${drawn} ${len}`;
    path.setAttribute('stroke-dasharray', dashVal);
    glowRef.current?.setAttribute('stroke-dasharray', dashVal);

    const heart = heartRef.current;
    if (heart) {
      if (clamped > 0.01 && clamped < 0.99) {
        const pt = path.getPointAtLength(drawn);
        heart.setAttribute('transform', `translate(${pt.x} ${pt.y}) scale(0.46)`);
        heart.setAttribute('opacity', '1');
      } else {
        heart.setAttribute('opacity', '0');
      }
    }
  }, [progress, pathData]);

  return (
    <g pointerEvents="none">
      <path
        ref={glowRef}
        d={pathData}
        fill="none"
        stroke={hexToRgba(heartColor, 0.25)}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray="0 99999"
      />
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={heartColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        opacity={0.9}
        strokeDasharray="0 99999"
      />
      {/* Leading heart — moved entirely via DOM attributes, never re-rendered */}
      <g ref={heartRef} opacity={0}>
        <path
          d="M0 -10 C -8 -18 -18 -10 -18 1 C -18 11 -8 18 0 26 C 8 18 18 11 18 1 C 18 -10 8 -18 0 -10 Z"
          fill={heartColor}
          stroke="#ffffff"
          strokeWidth={1.3}
          paintOrder="stroke fill"
        />
      </g>
    </g>
  );
}

function ProvinceLabel({
  province,
  interactive,
  isActive,
  onClick,
  senderProvince,
  receiverProvince,
  heartColor,
  cinematicCamera = false,
}: {
  province: Province;
  interactive: boolean;
  isActive: boolean;
  onClick?: (province: Province) => void;
  senderProvince?: string;
  receiverProvince?: string;
  heartColor: string;
  cinematicCamera?: boolean;
}) {
  const { label } = province;
  const isInactive = !interactive && !isActive;
  // Bigger labels in cinematic mode for active provinces
  const baseSize = label.fontSize || 12;
  const fontSize = isInactive
    ? Math.max(9, baseSize - 2)
    : Math.max(11, cinematicCamera ? (isActive ? baseSize + 4 : baseSize) : (interactive ? baseSize - 1 : baseSize - 2));
  const lineHeight = fontSize + 3;
  const textColor = province.id === senderProvince
    ? heartColor
    : province.id === receiverProvince
      ? '#ffd76a'
      : isInactive
        ? 'rgba(180, 210, 255, 0.55)'
        : 'rgba(229, 240, 255, 0.92)';

  return (
    <g
      onClick={interactive ? () => onClick?.(province) : undefined}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {label.outside && label.leaderTo && (
        <line
          x1={label.x}
          y1={label.y + 6}
          x2={label.leaderTo.x}
          y2={label.leaderTo.y}
          stroke={hexToRgba(textColor.startsWith('#') ? textColor : '#dbeafe', 0.55)}
          strokeWidth={1.4}
          strokeDasharray="4 4"
        />
      )}
      <text
        x={label.x}
        y={label.y}
        textAnchor="middle"
        fontFamily="var(--font-cairo), sans-serif"
        fontSize={fontSize}
        fontWeight={isActive ? 800 : 600}
        fill={textColor}
        stroke="rgba(1, 8, 20, 0.88)"
        strokeWidth={3.5}
        paintOrder="stroke fill"
        letterSpacing="0.15px"
      >
        {label.lines.map((line, index) => (
          <tspan key={line} x={label.x} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function IraqMap({
  highlightedProvince,
  senderProvince,
  receiverProvince,
  showPath = false,
  travelProgress = 1,
  onProvinceClick,
  className = '',
  heartColor = '#ff2d55',
  interactive = false,
  cinematicCamera = false,
}: IraqMapProps) {
  const provinceEntries = useMemo(() => Object.values(provinces), []);
  const sender = senderProvince ? provinces[senderProvince] : undefined;
  const receiver = receiverProvince ? provinces[receiverProvince] : undefined;
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const activeProvince = hoveredProvince || highlightedProvince;

  // Ref to the SVG group that receives the camera transform
  const cameraGroupRef = useRef<SVGGElement>(null);
  // Live camera tracking — follows the heart exactly along the bezier path, zero lag
  useLayoutEffect(() => {
    if (!cinematicCamera || !showPath || !sender || !receiver) return;
    const el = cameraGroupRef.current;
    if (!el) return;

    // Kill any running phase-transition tweens before direct tracking
    gsap.killTweensOf(el);

    // Sample the exact heart position on the bezier arc
    const d = getCurvedPath(sender, receiver);
    const sampler = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sampler.setAttribute('d', d);
    const len = sampler.getTotalLength();
    if (!len) return;

    const clamped = Math.max(0, Math.min(travelProgress, 1));
    const pt = sampler.getPointAtLength(len * clamped);
    const followZoom = 2.0;
    el.setAttribute(
      'transform',
      `translate(${CX - pt.x * followZoom},${CY - pt.y * followZoom}) scale(${followZoom})`,
    );
  }, [cinematicCamera, showPath, sender, receiver, travelProgress]);

  // Smooth GSAP transitions for non-travel phases (map-appear → overview, sender-glow → zoom sender)
  useEffect(() => {
    const el = cameraGroupRef.current;
    if (!el || !cinematicCamera || showPath) return;

    const zoom = sender ? 2.0 : 1.0;
    const tx = sender ? CX - sender.x * zoom : 0;
    const ty = sender ? CY - sender.y * zoom : 0;

    gsap.to(el, {
      attr: { transform: `translate(${tx},${ty}) scale(${zoom})` },
      duration: 1.6,
      ease: 'power2.inOut',
      overwrite: true,
    });
  }, [cinematicCamera, sender, showPath]);

  const wrapperClass = cinematicCamera
    ? `relative w-full h-full ${className}`
    : `map-platform-wrapper ${className}`;

  const svgClass = cinematicCamera ? 'w-full h-full' : 'map-svg-elevated';

  return (
    <div className={wrapperClass} style={cinematicCamera ? {} : { height: '100%' }}>
      {!cinematicCamera && (
        <>
          <div className="map-platform-shadow" />
          <div className="map-platform-ring" style={{ borderColor: hexToRgba(heartColor, 0.24) }} />
        </>
      )}

      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className={svgClass}
        style={cinematicCamera ? { display: 'block' } : { maxHeight: '100%', width: '100%' }}
        role="img"
        aria-label="خريطة العراق"
        overflow="hidden"
      >
        <defs>
          <clipPath id="mapClip">
            <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="36" />
          </clipPath>
          <linearGradient id="mapBackdrop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#071427" />
            <stop offset="52%" stopColor="#0b2445" />
            <stop offset="100%" stopColor="#08172c" />
          </linearGradient>
          <radialGradient id="mapGlow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor={hexToRgba(heartColor, 0.24)} />
            <stop offset="45%" stopColor="rgba(58, 138, 212, 0.18)" />
            <stop offset="100%" stopColor="rgba(6, 10, 24, 0)" />
          </radialGradient>
          <linearGradient id="provinceSenderGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4fb" />
            <stop offset="100%" stopColor={heartColor} />
          </linearGradient>
          <linearGradient id="provinceReceiverGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffbe7" />
            <stop offset="100%" stopColor="#f4b93c" />
          </linearGradient>
          <linearGradient id="provinceHighlightGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8efff" />
            <stop offset="100%" stopColor="#5ba3e6" />
          </linearGradient>
          <pattern id="mapGrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(123, 181, 255, 0.08)" strokeWidth="1" />
          </pattern>
          <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="rgba(0, 0, 0, 0.42)" />
          </filter>
        </defs>

        {/* Static background (outside camera transform so it always fills) */}
        <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="36" fill="url(#mapBackdrop)" />
        <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="36" fill="url(#mapGlow)" />
        <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="36" fill="url(#mapGrid)" opacity="0.9" />

        {/* Camera group — GSAP animates the SVG transform attribute on this element */}
        <g ref={cameraGroupRef} clipPath={cinematicCamera ? 'url(#mapClip)' : undefined}>
          <g filter="url(#mapShadow)">
            {provinceEntries.map((province, index) => {
              const isSender = province.id === senderProvince;
              const isReceiver = province.id === receiverProvince;
              const isActive = province.id === activeProvince || isSender || isReceiver;

              return (
                <motion.path
                  key={province.id}
                  d={province.path}
                  fill={provinceFill(province.id, senderProvince, receiverProvince, activeProvince || undefined, heartColor)}
                  stroke={isActive ? '#f8fbff' : 'rgba(143, 194, 247, 0.42)'}
                  strokeWidth={isActive ? 2.5 : 1.6}
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.015, duration: 0.45 }}
                  onMouseEnter={() => interactive && setHoveredProvince(province.id)}
                  onMouseLeave={() => interactive && setHoveredProvince((current) => (current === province.id ? null : current))}
                  onClick={() => interactive && onProvinceClick?.(province)}
                  style={{
                    cursor: interactive ? 'pointer' : 'default',
                    filter: isActive ? `drop-shadow(0 0 18px ${isSender ? heartColor : isReceiver ? '#fbbf24' : '#5ba3e6'})` : 'none',
                  }}
                />
              );
            })}
          </g>

          {showPath && sender && receiver && (
            <TravelPath
              sender={sender}
              receiver={receiver}
              heartColor={heartColor}
              progress={travelProgress}
            />
          )}

          {provinceEntries.map((province) => {
            const isSender = province.id === senderProvince;
            const isReceiver = province.id === receiverProvince;
            const isActive = province.id === activeProvince || isSender || isReceiver;

            return (
              <g key={`${province.id}-marker`}>
                {(interactive || isSender || isReceiver || province.id === activeProvince) && (
                  <>
                    {(isSender || isReceiver) && (
                      <ProvincePulse
                        cx={province.x}
                        cy={province.y}
                        color={isSender ? heartColor : '#fbbf24'}
                      />
                    )}
                    <circle
                      cx={province.x}
                      cy={province.y}
                      r={isSender || isReceiver ? 5.5 : 3.2}
                      fill={isSender ? heartColor : isReceiver ? '#fbbf24' : '#cae5ff'}
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth={1.4}
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}
                <ProvinceLabel
                  province={province}
                  interactive={interactive}
                  isActive={isActive}
                  onClick={onProvinceClick}
                  senderProvince={senderProvince}
                  receiverProvince={receiverProvince}
                  heartColor={heartColor}
                  cinematicCamera={cinematicCamera}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default memo(IraqMap);
