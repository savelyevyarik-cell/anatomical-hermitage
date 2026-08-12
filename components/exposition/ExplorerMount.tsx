'use client';

import dynamic from 'next/dynamic';
import SceneFallback from '@/components/three/SceneFallback';

/** Клиентская обёртка: 3D грузится только в браузере, с заглушкой на время загрузки. */
const BodyExplorer = dynamic(() => import('@/components/three/BodyExplorer'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[64svh] min-h-[480px] w-full border border-slate/15 bg-linen">
      <SceneFallback />
    </div>
  ),
});

export default function ExplorerMount() {
  return <BodyExplorer />;
}
