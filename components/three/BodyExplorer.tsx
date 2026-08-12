'use client';

import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

const MODEL = '/models/skeleton.glb';

export type Hotspot = {
  id: string;
  title: string;
  latin: string;
  text: string;
  /** Локальная позиция внутри группы модели */
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
    position: [0, 1.74, -0.12],
    camera: [0.7, 0.3, 2.0],
  },
  {
    id: 'thorax',
    title: 'Грудная клетка',
    latin: 'Thorax',
    text: 'Рёбра, грудина, органы грудной полости во влажных препаратах. Здесь же демонстрируется топография сердца и лёгких в естественном положении.',
    position: [0.6, 0.16, -0.28],
    camera: [1.1, 0.3, 2.2],
  },
  {
    id: 'spine',
    title: 'Позвоночный столб',
    latin: 'Columna vertebralis',
    text: 'Сравнительные препараты нормы и патологии осанки, подвижный монтаж для демонстрации объёма движений.',
    position: [0, -0.3, 0.55],
    camera: [-1.3, 0.3, 2.1],
  },
  {
    id: 'pelvis',
    title: 'Таз',
    latin: 'Pelvis',
    text: 'Половые различия костного таза — классический учебный сюжет, на котором объясняют связь формы и функции.',
    position: [0, -1.62, 0],
    camera: [0.8, 0.3, 2.1],
  },
  {
    id: 'limbs',
    title: 'Плечевой пояс',
    latin: 'Cingulum membri superioris',
    text: 'Ключицы и лопатки, а рядом — послойные мышечные препараты предплечья, суставы в разрезе и рентгенограммы тех же областей.',
    position: [0.5, 0.62, -0.15],
    camera: [1.2, 0.3, 2.0],
  },
];

const FIGURE_SCALE = 1.05;
/** Разворот, при котором к камере обращена грудина, а не позвоночник */
const FRONT = Math.PI;
const HOME = new THREE.Vector3(0, 0.1, 5.6);
const HOME_LOOK = new THREE.Vector3(0, 0, 0);

function Figure({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const material = new THREE.MeshStandardMaterial({
      color: '#D6CCBA',
      roughness: 0.78,
      metalness: 0,
    });
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = material;
    });
    return () => material.dispose();
  }, [model]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Фиксированный ¾-ракурс с медленным покачиванием: схема должна
    // читаться в любой момент, а не только в удачной фазе оборота
    group.current.rotation.y = FRONT - 0.6 + Math.sin(t * 0.16) * 0.34;
    group.current.position.y = Math.sin(t * 0.5) * 0.03;
  });

  return (
    <group ref={group} scale={FIGURE_SCALE}>
      <primitive object={model} />

      {HOTSPOTS.map((spot) => (
        <Html key={spot.id} position={spot.position} center distanceFactor={6} zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onSelect(spot.id)}
            aria-label={`${spot.title} — открыть описание раздела`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
              active === spot.id
                ? 'scale-125 border-azure bg-azure/25'
                : 'border-azure/60 bg-paper/70 hover:scale-110 hover:border-azure'
            }`}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-azure" />
          </button>
        </Html>
      ))}
    </group>
  );
}

/** Плавный облёт: камера и точка взгляда демпфируются к выбранному разделу. */
function CameraRig({ spot }: { spot: Hotspot | null }) {
  const look = useRef(HOME_LOOK.clone());
  const { camera } = useThree();

  const world = spot
    ? new THREE.Vector3(...spot.position).multiplyScalar(FIGURE_SCALE)
    : null;
  const target = world && spot ? world.clone().add(new THREE.Vector3(...spot.camera)) : HOME;
  // Панель открывается справа — уводим объект в левую половину кадра
  const lookTarget = world ? world.clone().setX(world.x + 0.7) : HOME_LOOK;

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
    <div className="relative h-[74svh] min-h-[520px] w-full overflow-hidden border border-slate/15 bg-linen">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.1, 5.6], fov: 42 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 4, 5]} intensity={2.2} color="#FFFFFF" />
        <directionalLight position={[-4, 0, 2]} intensity={0.8} color="#EFE3CE" />
        <directionalLight position={[-1, 2, -4]} intensity={1.4} color="#9FC4E4" />
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
              className="plaque mt-8 w-fit border border-slate/30 px-5 py-3 text-slate/80 transition-colors hover:border-azure hover:text-navy"
            >
              Вернуть общий вид
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <p className="plaque pointer-events-none absolute bottom-5 left-5 max-w-[24ch] text-slate/50">
        Точки на схеме открывают разделы собрания
      </p>
    </div>
  );
}

useGLTF.preload(MODEL);
