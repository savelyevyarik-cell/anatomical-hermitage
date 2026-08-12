'use client';

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import './FresnelMaterial';

/** Потерянный экспонат: пустой музейный сосуд, медленно вращающийся в темноте. */
function Jar() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[0.85, 0.85, 2.1, 48, 1, true]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.3}
          roughness={0.05}
          ior={1.3}
          chromaticAberration={0.05}
          color="#FFFFFF"
          attenuationColor="#DCEAF4"
          attenuationDistance={3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Крышка и основание */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.92, 0.88, 0.14, 48]} />
        <meshStandardMaterial color="#2E6BAA" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, -1.08, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 48]} />
        <meshStandardMaterial color="#2E6BAA" roughness={0.5} metalness={0.25} />
      </mesh>

      {/* Пустая этикетка */}
      <mesh position={[0, -0.2, 0.87]}>
        <planeGeometry args={[0.7, 0.42]} />
        <meshBasicMaterial color="#13294B" opacity={0.12} transparent />
      </mesh>
    </group>
  );
}

export default function LostExhibit() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.2, 5], fov: 40 }}>
      <color attach="background" args={['#FCFBF7']} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} color="#FFFDF8" />
      <directionalLight position={[-3, 1, 2]} intensity={1} color="#DCEAF4" />
      <Suspense fallback={null}>
        <Jar />
      </Suspense>
    </Canvas>
  );
}
