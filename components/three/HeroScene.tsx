'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SkeletonModel from './SkeletonModel';
import SceneFallback from './SceneFallback';

/**
 * Hero-сцена. Модель реагирует на курсор с инерцией, скролл
 * доворачивает её и уводит вниз.
 *
 * Бюджет производительности: здесь намеренно нет постпроцессинга,
 * HDR-окружения и преломляющего материала — они давали основную
 * нагрузку на кадр. Объём даёт свет: холодный ключевой, тёплый
 * заполняющий и контровой.
 */
export default function HeroScene() {
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);

  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) setSupported(false);

    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setMobile(window.matchMedia('(max-width: 767px)').matches);
    setReady(true);

    let frame = 0;
    const onPointer = (event: PointerEvent) => {
      // Читаем указатель через rAF: событие может прилетать чаще кадра
      if (frame) return;
      frame = requestAnimationFrame(() => {
        pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
        frame = 0;
      });
    };
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!ready || !supported) return <SceneFallback />;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={mobile ? [1, 1.3] : [1, 1.6]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <ambientLight intensity={1.15} />
        {/* Холодный ключевой — «негатоскоп» */}
        <directionalLight position={[3.5, 3.5, 4]} intensity={2.4} color="#FFFFFF" />
        {/* Тёплый заполняющий — латунь музейной витрины */}
        <directionalLight position={[-4, -1, 2]} intensity={0.9} color="#EFE3CE" />
        {/* Контровой холодный: отделяет кость от светлого фона */}
        <directionalLight position={[-1.5, 2, -4]} intensity={1.5} color="#9FC4E4" />

        <Suspense fallback={null}>
          <SkeletonModel
            reduced={reduced}
            scroll={scroll}
            pointer={pointer}
            offset={mobile ? [0, 0.35, 0] : [1.4, 0.1, 0]}
            scale={mobile ? 0.42 : 0.55}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
