'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';
import * as THREE from 'three';

interface GiftBox3DProps {
  heartColor?: string;
  onOpened?: () => void;
}

/* ── 3D Gift Box Mesh ── */
function GiftBoxMesh({ heartColor, state, onClick }: {
  heartColor: string;
  state: 'idle' | 'shake' | 'opening' | 'opened';
  onClick: () => void;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const lidAngle = useRef(0);
  const shakeTime = useRef(0);

  const color = useMemo(() => new THREE.Color(heartColor), [heartColor]);
  const lightColor = useMemo(() => color.clone().lerp(new THREE.Color('#ffffff'), 0.25), [color]);
  const darkColor = useMemo(() => color.clone().multiplyScalar(0.5), [color]);

  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffd700',
    emissive: '#ffd700',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.15,
  }), []);

  const velvetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.1,
    roughness: 0.6,
    envMapIntensity: 0.9,
  }), [color]);

  const velvetDarkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: darkColor,
    metalness: 0.1,
    roughness: 0.7,
  }), [darkColor]);

  useFrame((_, delta) => {
    if (state === 'opening' || state === 'opened') {
      lidAngle.current = THREE.MathUtils.lerp(lidAngle.current, -2.6, delta * 2);
    } else {
      lidAngle.current = THREE.MathUtils.lerp(lidAngle.current, 0, delta * 5);
    }
    if (lidRef.current) lidRef.current.rotation.x = lidAngle.current;

    if (state === 'shake') {
      shakeTime.current += delta * 25;
      if (bodyRef.current) {
        bodyRef.current.rotation.z = Math.sin(shakeTime.current) * 0.06;
        bodyRef.current.rotation.x = Math.cos(shakeTime.current * 1.3) * 0.03;
      }
    } else {
      shakeTime.current = 0;
      if (bodyRef.current) {
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * 8);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 8);
      }
    }

    if (glowRef.current) {
      const target = state === 'opening' || state === 'opened' ? 6 : 0;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, target, delta * 3);
    }
  });

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { document.body.style.cursor = state === 'idle' ? 'pointer' : 'default'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <group ref={bodyRef}>
        {/* Box body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.3, 1.3]} />
          <primitive object={velvetMat} attach="material" />
        </mesh>

        {/* Front highlight */}
        <mesh position={[0, 0.1, 0.656]}>
          <planeGeometry args={[1.6, 1.0]} />
          <meshStandardMaterial color={lightColor} transparent opacity={0.06} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Ribbons - front cross */}
        <mesh position={[0, 0, 0.66]}>
          <planeGeometry args={[1.82, 0.2]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.66]}>
          <planeGeometry args={[0.2, 1.32]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>

        {/* Ribbons - sides */}
        <mesh position={[-0.91, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.32, 0.2]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>
        <mesh position={[0.91, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.32, 0.2]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>
        <mesh position={[0, 0, -0.66]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.82, 0.2]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>

        {/* Inner glow */}
        <pointLight ref={glowRef} position={[0, 0.4, 0]} color={heartColor} intensity={0} distance={5} decay={2} />

        {/* Dark interior */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.6, 1.1, 1.1]} />
          <primitive object={velvetDarkMat} attach="material" />
        </mesh>
      </group>

      {/* Lid */}
      <group position={[0, 0.65, -0.65]}>
        <group ref={lidRef}>
          <group position={[0, 0.13, 0.65]}>
            <mesh castShadow>
              <boxGeometry args={[1.92, 0.26, 1.42]} />
              <primitive object={velvetMat} attach="material" />
            </mesh>

            {/* Lid ribbons */}
            <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.94, 0.2]} />
              <primitive object={ribbonMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[1.44, 0.2]} />
              <primitive object={ribbonMat} attach="material" />
            </mesh>

            {/* Bow */}
            <group position={[0, 0.2, 0.71]}>
              <mesh position={[-0.18, 0.1, 0]} rotation={[0.3, 0, -0.5]}>
                <torusGeometry args={[0.14, 0.045, 12, 20, Math.PI]} />
                <primitive object={ribbonMat} attach="material" />
              </mesh>
              <mesh position={[0.18, 0.1, 0]} rotation={[0.3, 0, 0.5]}>
                <torusGeometry args={[0.14, 0.045, 12, 20, Math.PI]} />
                <primitive object={ribbonMat} attach="material" />
              </mesh>
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <primitive object={ribbonMat} attach="material" />
              </mesh>
              <mesh position={[-0.08, -0.06, 0.02]} rotation={[0.2, 0, 0.3]}>
                <boxGeometry args={[0.08, 0.2, 0.02]} />
                <primitive object={ribbonMat} attach="material" />
              </mesh>
              <mesh position={[0.08, -0.08, 0.02]} rotation={[0.15, 0, -0.25]}>
                <boxGeometry args={[0.08, 0.22, 0.02]} />
                <primitive object={ribbonMat} attach="material" />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ── Sparkle burst ── */
function BurstParticles({ heartColor, active }: { heartColor: string; active: boolean }) {
  if (!active) return null;
  return (
    <>
      <Sparkles count={80} scale={5} size={4} speed={0.6} color={heartColor} opacity={0.7} />
      <Sparkles count={40} scale={5} size={5} speed={0.3} color="#ffd700" opacity={0.4} />
    </>
  );
}

/* ── Camera rig ── */
function CameraRig({ state }: { state: string }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const tZ = state === 'opening' || state === 'opened' ? 4.8 : 5.7;
    const tY = state === 'opening' || state === 'opened' ? 1.8 : 1.4;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tZ, delta * 2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, tY, delta * 2);
    camera.lookAt(0, 0.15, 0);
  });
  return null;
}

export default function GiftBox3D({ heartColor = '#ff2d55', onOpened }: GiftBox3DProps) {
  const [state, setState] = useState<'idle' | 'shake' | 'opening' | 'opened'>('idle');

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;
    setState('shake');
    setTimeout(() => setState('opening'), 800);
    setTimeout(() => {
      setState('opened');
      onOpened?.();
    }, 3200);
  }, [state, onOpened]);

  return (
    <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px]">
      {/* 3D Scene — fills the entire container */}
      <Canvas
        camera={{ position: [0, 1.4, 5.7], fov: 40 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power', stencil: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
          <CameraRig state={state} />

          <ambientLight intensity={0.35} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1}
            color="#fff5ee"
          />
          <directionalLight position={[-2, 3, -3]} intensity={0.22} color="#4060ff" />
          <pointLight position={[0, 3, 0]} intensity={0.38} color={heartColor} distance={6} />
          <spotLight
            position={[0, 6, 0]}
            angle={0.4}
            penumbra={0.8}
            intensity={1.25}
            color="#fff5ee"
          />

          <Float
            speed={state === 'idle' ? 2 : 0}
            rotationIntensity={state === 'idle' ? 0.15 : 0}
            floatIntensity={state === 'idle' ? 0.4 : 0}
          >
            <GiftBoxMesh heartColor={heartColor} state={state} onClick={handleClick} />
          </Float>

          <BurstParticles heartColor={heartColor} active={state === 'opening' || state === 'opened'} />
        </Canvas>

        {/* Tap hint — overlaid on canvas bottom */}
        <AnimatePresence>
          {state === 'idle' && (
            <motion.div
              className="absolute bottom-4 inset-x-0 text-center space-y-2 pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Gift className="w-5 h-5 mx-auto text-white/30" />
              </motion.div>
              <p className="text-white/25 text-xs tracking-[0.18em] font-light">
                اضغط على الهدية لفتحها
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
