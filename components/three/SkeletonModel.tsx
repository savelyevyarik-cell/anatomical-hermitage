'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const MODEL = '/models/skeleton.glb';
/** Разворот, при котором к камере обращена грудина, а не позвоночник */
const FRONT = Math.PI;

/**
 * Модель торсового скелета, собранная в Blender скриптом
 * `tools/build_skeleton.py` и выгруженная в GLB (~20k треугольников,
 * один меш — один draw call).
 *
 * Материал переопределяется здесь, а не берётся из файла: на светлом
 * фоне сайта кость должна быть матовой и чуть холоднее белого,
 * иначе она сливается с подложкой.
 */

export type SkeletonProps = {
  /** prefers-reduced-motion: объект замирает в выразительном ракурсе */
  reduced?: boolean;
  scroll?: React.MutableRefObject<number>;
  pointer?: React.MutableRefObject<{ x: number; y: number }>;
  offset?: [number, number, number];
  scale?: number;
  /** Частота покачивания вокруг ¾-ракурса */
  spin?: number;
};

export default function SkeletonModel({
  reduced = false,
  scroll,
  pointer,
  offset = [0, 0, 0],
  scale = 1,
  spin = 0.16,
}: SkeletonProps) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);

  // Клонируем: одна и та же модель используется на двух страницах
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const material = new THREE.MeshStandardMaterial({
      color: '#D6CCBA',
      roughness: 0.78,
      metalness: 0.0,
      envMapIntensity: 0.4,
    });

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = material;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });

    return () => material.dispose();
  }, [model]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.05);
    const s = scroll?.current ?? 0;
    const px = pointer?.current.x ?? 0;
    const py = pointer?.current.y ?? 0;

    // FRONT = π: в glTF передняя сторона модели (в Blender это +Y)
    // смотрит от камеры, без разворота виден скелет со спины.
    // Дальше — не полный оборот, а покачивание вокруг ¾-ракурса:
    // полный оборот половину времени показывает объект «в профиль»,
    // где клетка читается как стопка рёбер.
    const swing = Math.sin(state.clock.elapsedTime * spin) * 0.42;
    const targetY = reduced ? FRONT - 0.5 : FRONT - 0.55 + swing + px * 0.4 + s * 1.1;
    const targetX = reduced ? 0.06 : -py * 0.18 + s * 0.24;

    // Демпфирование: модель догоняет цель, а не прыгает за курсором
    group.current.rotation.y += (targetY - group.current.rotation.y) * (1 - Math.pow(0.002, d));
    group.current.rotation.x += (targetX - group.current.rotation.x) * (1 - Math.pow(0.002, d));
    group.current.position.y = offset[1] - s * 0.5;
  });

  return (
    <group ref={group} scale={scale} position={offset}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL);
