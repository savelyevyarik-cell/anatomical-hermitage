'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { buildCage } from '@/lib/anatomy';

export type Hotspot = {
  id: string;
  title: string;
  latin: string;
  text: string;
  /** Локальная позиция внутри группы фигуры */
  position: [number, number, number];
  /** Смещение камеры относительно точки — направление и дистанция облёта */
  camera: [number, number, number];
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'skull',
    title: 'Череп',
    latin: 'Cranium',
    text: 'Разъёмные гипсовые модели и натуральные препараты: свод, основание, ход черепных нервов. Раздел, с которого начинается любая экскурсия по остеологии.',
    position: [0, 1.72, 0],
    camera: [0.7, 0.35, 1.9],
  },
  {
    id: 'thorax',
    title: 'Грудная клетка',
    latin: 'Thorax',
    text: 'Рёбра, грудина, органы грудной полости во влажных препаратах. Здесь же демонстрируется топография сердца и лёгких в естественном положении.',
    position: [0.42, 0.42, 0.5],
    camera: [1.0, 0.3, 2.1],
  },
  {
    id: 'spine',
    title: 'Позвоночный столб',
    latin: 'Columna vertebralis',
    text: 'Сравнительные препараты нормы и патологии осанки, подвижный монтаж для демонстрации объёма движений.',
    position: [0, 0.15, -0.68],
    camera: [-1.3, 0.3, 2.0],
  },
  {
    id: 'pelvis',
    title: 'Таз',
    latin: 'Pelvis',
    text: 'Половые различия костного таза — классический учебный сюжет, на котором объясняют связь формы и функции.',
    position: [0, -1.34, -0.24],
    camera: [0.8, 0.25, 2.0],
  },
  {
    id: 'limbs',
    title: 'Конечности',
    latin: 'Membra',
    text: 'Послойные мышечные препараты предплечья и голени, суставы в разрезе, рентгенограммы тех же областей рядом.',
    position: [1.02, 0.62, 0.05],
    camera: [1.2, 0.25, 2.0],
  },
];

const FIGURE_SCALE = 0.62;
const FIGURE_SHIFT = 0.18;
const HOME = new THREE.Vector3(0, 0.1, 4.4);
const HOME_LOOK = new THREE.Vector3(0, -0.1, 0);

/* Сухая кость: матовая, без прозрачности и без «мокрого» блика */
const BONE_PROPS = {
  color: '#F0E9DA',
  roughness: 0.88,
  metalness: 0,
} as const;

function Figure({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) {
  const group = useRef<THREE.Group>(null);
  const cage = useMemo(() => buildCage(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.position.y = FIGURE_SHIFT + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
  });

  return (
    <group ref={group} scale={FIGURE_SCALE} position={[0, FIGURE_SHIFT, 0]}>
      {/* Грудная клетка — та же процедурная геометрия, что и в hero */}
      <mesh geometry={cage} position={[0, 0.15, 0]}>
        <meshStandardMaterial {...BONE_PROPS} />
      </mesh>

      {/* Череп */}
      <mesh position={[0, 1.72, -0.12]} scale={[1, 1.18, 1.1]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <meshStandardMaterial {...BONE_PROPS} opacity={0.58} />
      </mesh>
      {/* Шейный отдел */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`c-${i}`} position={[0, 1.34 - i * 0.11, -0.14]}>
          <cylinderGeometry args={[0.075, 0.08, 0.09, 10]} />
          <meshStandardMaterial {...BONE_PROPS} opacity={0.66} />
        </mesh>
      ))}

      {/* Плечевой пояс */}
      {[-1, 1].map((side) => (
        <group key={`sh-${side}`}>
          <mesh position={[side * 0.52, 0.98, 0.04]} rotation={[0, 0, side * 1.35]}>
            <capsuleGeometry args={[0.035, 0.62, 4, 10]} />
            <meshStandardMaterial {...BONE_PROPS} />
          </mesh>
          <mesh position={[side * 1.02, 0.62, 0.05]} rotation={[0, 0, side * 0.16]}>
            <capsuleGeometry args={[0.055, 0.78, 4, 10]} />
            <meshStandardMaterial {...BONE_PROPS} />
          </mesh>
        </group>
      ))}

      {/* Поясничный отдел — связывает клетку с тазом */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`l-${i}`} position={[0, -0.72 - i * 0.13, -0.4]}>
          <cylinderGeometry args={[0.08, 0.084, 0.1, 10]} />
          <meshStandardMaterial {...BONE_PROPS} />
        </mesh>
      ))}

      {/* Таз */}
      <mesh position={[0, -1.34, -0.24]} rotation={[Math.PI / 2.15, 0, 0]}>
        <torusGeometry args={[0.4, 0.085, 10, 32, Math.PI * 1.25]} />
        <meshStandardMaterial {...BONE_PROPS} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`f-${side}`} position={[side * 0.26, -1.82, -0.16]} rotation={[0, 0, side * 0.06]}>
          <capsuleGeometry args={[0.062, 0.52, 4, 10]} />
          <meshStandardMaterial {...BONE_PROPS} />
        </mesh>
      ))}

      {HOTSPOTS.map((spot) => (
        <Html key={spot.id} position={spot.position} center distanceFactor={7} zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onSelect(spot.id)}
            aria-label={`${spot.title} — открыть описание раздела`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
              active === spot.id
                ? 'scale-125 border-azure bg-azure/25'
                : 'border-azure/50 bg-paper/60 hover:scale-110 hover:border-azure'
            }`}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-azure" />
          </button>
        </Html>
      ))}
    </group>
  );
}

/**
 * Плавный облёт: камера и точка взгляда демпфируются к выбранному
 * разделу. Мировые координаты считаются из локальных позиций хотспотов,
 * поэтому масштаб фигуры можно менять безопасно.
 */
function CameraRig({ spot }: { spot: Hotspot | null }) {
  const look = useRef(HOME_LOOK.clone());
  const { camera } = useThree();

  const world = spot
    ? new THREE.Vector3(
        spot.position[0] * FIGURE_SCALE,
        spot.position[1] * FIGURE_SCALE + FIGURE_SHIFT,
        spot.position[2] * FIGURE_SCALE
      )
    : null;

  const target = world && spot ? world.clone().add(new THREE.Vector3(...spot.camera)) : HOME;
  // Панель открывается справа — уводим объект в левую половину кадра
  const lookTarget = world ? world.clone().setX(world.x + 0.75) : HOME_LOOK;

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 2.2, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 2.2, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 2.2, d);

    look.current.x = THREE.MathUtils.damp(look.current.x, lookTarget.x, 2.2, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, lookTarget.y, 2.2, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, lookTarget.z, 2.2, d);
    camera.lookAt(look.current);
  });

  return null;
}

export default function BodyExplorer() {
  const [active, setActive] = useState<string | null>(null);
  const spot = HOTSPOTS.find((s) => s.id === active) ?? null;

  return (
    <div className="relative h-[64svh] min-h-[480px] w-full overflow-hidden border border-slate/15 bg-linen">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.1, 4.4], fov: 42 }}>
        <color attach="background" args={['#F2ECE1']} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} color="#FFFDF8" />
        <directionalLight position={[-5, 2, 3]} intensity={1.1} color="#DCEAF4" />
        <pointLight position={[0, -3, 2]} intensity={16} color="#8CC0E4" />
        <Suspense fallback={null}>
          <Figure active={active} onSelect={setActive} />
        </Suspense>
        <CameraRig spot={spot} />
      </Canvas>

      <AnimatePresence>
        {spot ? (
          <motion.aside
            key={spot.id}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col justify-between border-l border-slate/15 bg-paper/95 p-8 backdrop-blur-sm"
          >
            <div>
              <p className="plaque text-azure">{spot.latin}</p>
              <h3 className="mt-4 font-display text-h3 text-navy">{spot.title}</h3>
              <p className="mt-5 text-small text-slate/80">{spot.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="plaque mt-8 w-fit btn-ghost px-5 py-3"
            >
              Вернуть общий вид
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <p className="plaque pointer-events-none absolute bottom-5 left-5 max-w-[24ch] text-slate/45">
        Точки на схеме открывают разделы собрания
      </p>
    </div>
  );
}
