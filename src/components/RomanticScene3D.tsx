'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating hearts particle system
function Hearts({ count = 15, color = '#ff2d55' }: { count?: number; color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.05 + Math.random() * 0.1,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.sin(t * p.speed * 0.7 + p.offset) * 0.3 + t * p.speed * 0.1 % 6 - 3,
        p.position[2]
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 2 + p.offset) * 0.2));
      dummy.rotation.z = Math.sin(t + p.offset) * 0.3;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Heart shape
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.bezierCurveTo(-0.3, -1, -1, -0.8, -1, -0.2);
    shape.bezierCurveTo(-1, 0.3, 0, 0.8, 0, 1);
    shape.bezierCurveTo(0, 0.8, 1, 0.3, 1, -0.2);
    shape.bezierCurveTo(1, -0.8, 0.3, -1, 0, -0.5);
    return shape;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <shapeGeometry args={[heartShape]} />
      <meshBasicMaterial color={colorObj} transparent opacity={0.4} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// Soft particle system
function Particles({ count = 30 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      speed: 0.1 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.8,
        p.position[1] + Math.cos(t * p.speed * 0.5 + p.offset) * 0.4,
        p.position[2]
      );
      dummy.scale.setScalar(0.02 + Math.sin(t * 1.5 + p.offset) * 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
    </instancedMesh>
  );
}

interface RomanticSceneProps {
  heartColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

function Scene({ heartColor = '#ff2d55', intensity = 'medium' }: RomanticSceneProps) {
  const heartCount = intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25;
  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50;

  return (
    <>
      <Hearts count={heartCount} color={heartColor} />
      <Particles count={particleCount} />
    </>
  );
}

export default function RomanticScene3D({
  heartColor = '#ff2d55',
  intensity = 'medium',
}: RomanticSceneProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Scene heartColor={heartColor} intensity={intensity} />
      </Canvas>
    </div>
  );
}
