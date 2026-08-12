'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import RibCage from './RibCage';
import Dust from './Dust';
import SceneFallback from './SceneFallback';

/**
 * Hero-сцена. Камера и объект реагируют на курсор с инерцией,
 * скролл разворачивает грудную клетку. На мобильных сцена
 * упрощается: без bloom, без пылинок, ниже dpr.
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

    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!ready || !supported) return <SceneFallback />;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={mobile ? [1, 1.4] : [1, 1.8]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6.4], fov: 38 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <color attach="background" args={['#FCFBF7']} />
        <fog attach="fog" args={['#FCFBF7', 9, 17]} />

        {/* Мягкий верхний свет витрины плюс холодная подсветка снизу */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[3.5, 5, 4]} intensity={2.4} color="#FFFDF8" />
        <directionalLight position={[-4, 1.5, 2]} intensity={1.1} color="#DCEAF4" />
        <pointLight position={[0, -3, 1.5]} intensity={14} color="#8CC0E4" />

        <Suspense fallback={null}>
          <RibCage
            reduced={reduced}
            simple={mobile}
            scroll={scroll}
            pointer={pointer}
            /* На узком экране объект уходит вверх и уменьшается — под заголовок */
            offset={mobile ? [0, 1.15, 0] : [1.55, 0.25, 0]}
            scale={mobile ? 0.6 : 1.0}
          />
          {!mobile && !reduced ? <Dust /> : null}
        </Suspense>
      </Canvas>
    </div>
  );
}
