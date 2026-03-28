'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { provinces, Province, getCurvedPath } from '@/lib/provinces';

/* ──────────────────────────────────────────────
   Helpers: convert 2D SVG coords → 3D sphere
   SVG viewBox is 800×750, map to lat/lon then sphere
   ────────────────────────────────────────────── */

const GLOBE_RADIUS = 2.4;

/** Convert SVG (x,y) in 800×750 to (lon,lat) in radians on sphere surface */
function svgToSphere(x: number, y: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  // Map x: 0→800 to longitude -0.55→0.55 radians (~±31°)
  // Map y: 0→750 to latitude  0.55→-0.55 radians (top=north)
  const lon = ((x / 800) - 0.5) * 1.1;
  const lat = ((y / 750) - 0.5) * -1.1;

  const phi = Math.PI / 2 - lat;
  const theta = lon;

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  );
}

/* ──────────────────────────────────────────────
   Province Dot on globe
   ────────────────────────────────────────────── */
interface ProvinceDotProps {
  province: Province;
  isActive: boolean;
  isSender: boolean;
  isReceiver: boolean;
  heartColor: string;
}

function ProvinceDot({ province, isActive, isSender, isReceiver, heartColor }: ProvinceDotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => svgToSphere(province.x, province.y), [province.x, province.y]);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = isSender ? heartColor : isReceiver ? '#fbbf24' : '#8ec8e8';
  const scale = isActive ? 1.8 : 1.1;

  useFrame(({ clock }) => {
    if (glowRef.current && isActive) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.4;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.035 * scale, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 3 : 0.6}
        />
      </mesh>
      {/* Glow halo */}
      {isActive && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.25}
          />
        </mesh>
      )}
    </group>
  );
}

/* ──────────────────────────────────────────────
   Travel Arc on globe
   ────────────────────────────────────────────── */
interface TravelArcProps {
  sender: Province;
  receiver: Province;
  heartColor: string;
  progress: number; // 0→1
}

function TravelArc({ sender, receiver, heartColor, progress }: TravelArcProps) {
  const { curve, points } = useMemo(() => {
    const start = svgToSphere(sender.x, sender.y);
    const end = svgToSphere(receiver.x, receiver.y);

    // Midpoint lifted above the surface
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.normalize().multiplyScalar(GLOBE_RADIUS + 0.4);

    const c = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = c.getPoints(80);
    return { curve: c, points: pts };
  }, [sender, receiver]);

  // Trail line object
  const trailLine = useMemo(() => {
    const count = Math.max(2, Math.floor(progress * points.length));
    const subset = points.slice(0, count);
    const geo = new THREE.BufferGeometry().setFromPoints(subset);
    const mat = new THREE.LineBasicMaterial({
      color: heartColor,
      transparent: true,
      opacity: 0.6,
    });
    return new THREE.Line(geo, mat);
  }, [points, progress, heartColor]);

  // Heart position
  const heartPos = useMemo(() => {
    return curve.getPointAt(Math.min(progress, 1));
  }, [curve, progress]);

  return (
    <group>
      {/* Glow trail */}
      <primitive object={trailLine} />

      {/* Traveling heart sphere */}
      {progress > 0 && progress < 1 && (
        <mesh position={heartPos}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            color={heartColor}
            emissive={heartColor}
            emissiveIntensity={3}
          />
        </mesh>
      )}
    </group>
  );
}

/* ──────────────────────────────────────────────
   Globe mesh with atmosphere
   ────────────────────────────────────────────── */
interface GlobeBodyProps {
  rotating: boolean;
  heartColor: string;
}

function GlobeBody({ rotating, heartColor }: GlobeBodyProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current && rotating) {
      globeRef.current.rotation.y += 0.001;
    }
    if (atmosphereRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.005;
      atmosphereRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      {/* Main globe - realistic ocean */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#0a3d6b"
          metalness={0.15}
          roughness={0.85}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* Inner depth layer */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS - 0.01, 64, 64]} />
        <meshStandardMaterial
          color="#072a4a"
          emissive="#041e35"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Latitude/longitude grid */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.004, 24, 18]} />
        <meshBasicMaterial color="#2e6ea6" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Fine grid overlay */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.006, 48, 36]} />
        <meshBasicMaterial color="#1a4f7a" wireframe transparent opacity={0.04} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.08, 64, 64]} />
        <meshStandardMaterial
          color="#5ba3e6"
          emissive="#3a8ad4"
          emissiveIntensity={0.25}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Heart-color atmosphere tint */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.15, 64, 64]} />
        <meshStandardMaterial
          color={heartColor}
          emissive={heartColor}
          emissiveIntensity={0.08}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmosphere - blue haze */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.25, 64, 64]} />
        <meshStandardMaterial
          color="#6eb5ff"
          emissive="#4a90d9"
          emissiveIntensity={0.12}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

/* ──────────────────────────────────────────────
   Main Globe3D component
   ────────────────────────────────────────────── */
interface Globe3DProps {
  senderProvince?: string;
  receiverProvince?: string;
  showTravel?: boolean;
  travelProgress?: number;
  rotating?: boolean;
  heartColor?: string;
  className?: string;
}

export default function Globe3D({
  senderProvince,
  receiverProvince,
  showTravel = false,
  travelProgress = 0,
  rotating = false,
  heartColor = '#ff2d55',
  className = '',
}: Globe3DProps) {
  const sender = senderProvince ? provinces[senderProvince] : undefined;
  const receiver = receiverProvince ? provinces[receiverProvince] : undefined;
  const provinceEntries = useMemo(() => Object.values(provinces), []);

  return (
    <div className={`globe-3d-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting - warm sunlight */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#fffaf0" />
        <directionalLight position={[-3, -2, 4]} intensity={0.4} color="#6eb5ff" />
        <pointLight position={[0, 2, 4]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, 0, 4]} intensity={0.3} color={heartColor} />

        {/* Background stars */}
        <Stars radius={20} depth={40} count={1500} factor={3} saturation={0} fade speed={0.5} />

        {/* Globe */}
        <group rotation={[0.15, -0.3, 0]}>
          <GlobeBody rotating={rotating} heartColor={heartColor} />

          {/* Province dots */}
          {provinceEntries.map((province) => (
            <ProvinceDot
              key={province.id}
              province={province}
              isActive={province.id === senderProvince || province.id === receiverProvince}
              isSender={province.id === senderProvince}
              isReceiver={province.id === receiverProvince}
              heartColor={heartColor}
            />
          ))}

          {/* Travel arc */}
          {showTravel && sender && receiver && (
            <TravelArc
              sender={sender}
              receiver={receiver}
              heartColor={heartColor}
              progress={travelProgress}
            />
          )}
        </group>

        {/* Subtle auto-rotation for idle */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={rotating}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
