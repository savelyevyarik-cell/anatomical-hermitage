'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { buildCage } from '@/lib/anatomy';
import './FresnelMaterial';

type Props = {
  /** prefers-reduced-motion: объект замирает */
  reduced?: boolean;
  /** Мобильный/слабый рендер: дешёвый материал вместо преломления */
  simple?: boolean;
  /** 0…1 — прогресс скролла героя, разворачивает объект */
  scroll?: React.MutableRefObject<number>;
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  /** Сдвиг композиции: на десктопе объект уходит вправо, освобождая место заголовку */
  offset?: [number, number, number];
  scale?: number;
};

export default function RibCage({
  reduced = false,
  simple = false,
  scroll,
  pointer,
  offset = [0, 0, 0],
  scale = 1.05,
}: Props) {
  const geometry = useMemo(() => buildCage(), []);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.05);
    const s = scroll?.current ?? 0;
    const px = pointer?.current.x ?? 0;
    const py = pointer?.current.y ?? 0;

    // Даже в покое клетка стоит вполоборота — фронтальный вид её «схлопывает»
    const targetY = reduced ? 0.85 : state.clock.elapsedTime * 0.09 + px * 0.5 + s * 1.6;
    const targetX = reduced ? 0.12 : -py * 0.28 + s * 0.35;

    // Демпфирование: объект догоняет цель, а не прыгает за курсором
    group.current.rotation.y += (targetY - group.current.rotation.y) * (1 - Math.pow(0.0015, d));
    group.current.rotation.x += (targetX - group.current.rotation.x) * (1 - Math.pow(0.0015, d));
    group.current.position.y = offset[1] - s * 0.55;

    const material = glow.current?.material as THREE.ShaderMaterial | undefined;
    if (material?.uniforms?.uTime) material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={group} scale={scale} position={[offset[0], offset[1], offset[2]]}>
      {/* Сухая кость: матовая поверхность музейного препарата, без стекла */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#F0E9DA"
          roughness={0.88}
          metalness={0}
          envMapIntensity={0.35}
        />
      </mesh>

      {/* Едва заметная холодная кромка — след рентгеновской подсветки */}
      <mesh ref={glow} geometry={geometry} scale={1.008}>
        <xrayFresnelMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          uPower={3.4}
          uColor="#8CC0E4"
          uRim="#2E6BAA"
          uIntensity={simple ? 0.14 : 0.22}
        />
      </mesh>
    </group>
  );
}
