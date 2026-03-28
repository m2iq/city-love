'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ──────────────────────────────────────────────
   3D Gift Box mesh
   ────────────────────────────────────────────── */
interface BoxMeshProps {
  heartColor: string;
  state: 'idle' | 'opening' | 'opened';
  onClick: () => void;
}

function BoxMesh({ heartColor, state, onClick }: BoxMeshProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const lidAngle = useRef(0);
  const color = new THREE.Color(heartColor);
  const darkColor = color.clone().multiplyScalar(0.6);
  const lightColor = color.clone().lerp(new THREE.Color('#ffffff'), 0.2);

  useFrame((_, delta) => {
    // Lid opening animation
    if (state === 'opening' || state === 'opened') {
      lidAngle.current = THREE.MathUtils.lerp(lidAngle.current, -2.4, delta * 2.5);
    } else {
      lidAngle.current = THREE.MathUtils.lerp(lidAngle.current, 0, delta * 4);
    }
    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current;
    }

    // Inner glow intensity
    if (glowRef.current) {
      const target = state === 'opening' || state === 'opened' ? 5 : 0;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, target, delta * 3);
    }
  });

  const ribbonColor = '#ffd700';
  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: ribbonColor,
    emissive: ribbonColor,
    emissiveIntensity: 0.4,
    metalness: 0.7,
    roughness: 0.2,
  }), []);

  return (
    <group onClick={onClick} onPointerOver={() => { document.body.style.cursor = state === 'idle' ? 'pointer' : 'default'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      {/* Box body */}
      <group ref={bodyRef}>
        {/* Main box (front face visible) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 1.2]} />
          <meshStandardMaterial
            color={color}
            metalness={0.15}
            roughness={0.55}
            envMapIntensity={0.8}
          />
        </mesh>

        {/* Velvet shine overlay */}
        <mesh position={[0, 0, 0.601]}>
          <planeGeometry args={[1.6, 1.2]} />
          <meshStandardMaterial
            color={lightColor}
            transparent
            opacity={0.08}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Horizontal ribbon */}
        <mesh position={[0, 0, 0.61]}>
          <planeGeometry args={[1.62, 0.18]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>
        {/* Vertical ribbon */}
        <mesh position={[0, 0, 0.61]}>
          <planeGeometry args={[0.18, 1.22]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>

        {/* Side ribbon (left) */}
        <mesh position={[-0.81, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.22, 0.18]} />
          <primitive object={ribbonMat} attach="material" />
        </mesh>

        {/* Inner glow light */}
        <pointLight
          ref={glowRef}
          position={[0, 0.3, 0]}
          color={heartColor}
          intensity={0}
          distance={4}
          decay={2}
        />
      </group>

      {/* Lid – pivots from back edge */}
      <group position={[0, 0.6, -0.6]}>
        <group ref={lidRef}>
          <mesh position={[0, 0.12, 0.6]} castShadow>
            <boxGeometry args={[1.72, 0.24, 1.32]} />
            <meshStandardMaterial
              color={color}
              metalness={0.15}
              roughness={0.5}
              envMapIntensity={0.8}
            />
          </mesh>
          {/* Lid top shine */}
          <mesh position={[0, 0.25, 0.6]}>
            <planeGeometry args={[1.72, 1.32]} />
            <meshStandardMaterial
              color={lightColor}
              transparent
              opacity={0.06}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Lid ribbon */}
          <mesh position={[0, 0.26, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.74, 0.18]} />
            <primitive object={ribbonMat} attach="material" />
          </mesh>

          {/* Bow */}
          <group position={[0, 0.26, 1.26]}>
            {/* Left loop */}
            <mesh position={[-0.15, 0.12, 0]} rotation={[0, 0, -0.4]}>
              <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
              <primitive object={ribbonMat} attach="material" />
            </mesh>
            {/* Right loop */}
            <mesh position={[0.15, 0.12, 0]} rotation={[0, 0, 0.4]}>
              <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
              <primitive object={ribbonMat} attach="material" />
            </mesh>
            {/* Knot */}
            <mesh position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <primitive object={ribbonMat} attach="material" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────
   Floating particles around the scene
   ────────────────────────────────────────────── */
function SceneParticles({ heartColor, active }: { heartColor: string; active: boolean }) {
  if (!active) return null;
  return (
    <>
      <Sparkles
        count={60}
        scale={6}
        size={3}
        speed={0.4}
        color={heartColor}
        opacity={0.6}
      />
      <Sparkles
        count={30}
        scale={6}
        size={4}
        speed={0.2}
        color="#ffd700"
        opacity={0.3}
      />
    </>
  );
}

/* ──────────────────────────────────────────────
   Ground plane with reflection
   ────────────────────────────────────────────── */
function GroundPlane({ heartColor }: { heartColor: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
      <circleGeometry args={[3, 64]} />
      <meshStandardMaterial
        color="#0a0a18"
        metalness={0.9}
        roughness={0.15}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────
   Camera auto-animator
   ────────────────────────────────────────────── */
function CameraRig({ state }: { state: string }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const targetZ = state === 'opening' || state === 'opened' ? 4.5 : 5;
    const targetY = state === 'opening' || state === 'opened' ? 1.5 : 1.2;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 2);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

/* ──────────────────────────────────────────────
   Main exported component
   ────────────────────────────────────────────── */
interface GiftScene3DProps {
  heartColor?: string;
  onOpened?: () => void;
}

export default function GiftScene3D({ heartColor = '#ff2d55', onOpened }: GiftScene3DProps) {
  const [state, setState] = useState<'idle' | 'opening' | 'opened'>('idle');

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;
    setState('opening');
    setTimeout(() => {
      setState('opened');
      onOpened?.();
    }, 3000);
  }, [state, onOpened]);

  return (
    <div className="gift-scene-3d-container">
      {/* Tap hint (HTML overlay) */}
      {state === 'idle' && (
        <div className="gift-scene-3d-hint">
          <p>اضغط على الهدية لفتحها</p>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.2, 5], fov: 40 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CameraRig state={state} />

        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          color="#fff5ee"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, 3, -3]} intensity={0.3} color="#4060ff" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color={heartColor} distance={8} />

        {/* Spotlight from above */}
        <spotLight
          position={[0, 6, 0]}
          angle={0.4}
          penumbra={0.8}
          intensity={2}
          color="#fff5ee"
          castShadow
          target-position={[0, 0, 0]}
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* The gift box */}
        <Float
          speed={state === 'idle' ? 2 : 0}
          rotationIntensity={state === 'idle' ? 0.15 : 0}
          floatIntensity={state === 'idle' ? 0.4 : 0}
        >
          <BoxMesh heartColor={heartColor} state={state} onClick={handleClick} />
        </Float>

        {/* Ground */}
        <GroundPlane heartColor={heartColor} />

        {/* Sparkles */}
        <SceneParticles heartColor={heartColor} active={state === 'opening' || state === 'opened'} />
      </Canvas>
    </div>
  );
}
