'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';

/**
 * Full-bleed рентгенологический зал. Кадр уезжает параллаксом,
 * а курсор работает негатоскопом: под ним снимок «просвечивает».
 */
export default function XrayRoom() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.04, 1.12]);

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    root.current.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    root.current.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <section
      ref={root}
      onPointerMove={onMove}
      /* Единственная тёмная секция сайта — это и есть затемнённый зал */
      className="relative isolate h-[110svh] overflow-hidden bg-navy"
      aria-labelledby="xray-title"
      data-cursor="Просветить"
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '50%' }}
    >
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src="/images/anatomy-4.jpg"
          alt="Рентгенологический зал музея: стены целиком выложены подсвеченными снимками"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter: 'saturate(0.5) brightness(0.62) contrast(1.12) hue-rotate(-8deg)' }}
        />
      </motion.div>

      {/* Слой «просвечивания» — виден только вокруг курсора */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          y,
          scale,
          WebkitMaskImage:
            'radial-gradient(circle 190px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.55) 45%, transparent 72%)',
          maskImage:
            'radial-gradient(circle 190px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.55) 45%, transparent 72%)',
        }}
      >
        <Image
          src="/images/anatomy-4.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter: 'brightness(1.9) contrast(1.25) saturate(0.35) hue-rotate(-12deg)' }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-navy/75" />

      <div className="shell relative flex h-full flex-col justify-between py-[var(--section-y)]">
        <p className="plaque text-sky">Зал 03 · Radiologia</p>

        <div className="max-w-[22ch]">
          <h2 id="xray-title" className="font-display text-h2 text-paper">
            <SplitText text="Свет здесь идёт" className="block" />
            <SplitText text="не сверху, а из стен" className="block text-sky" delay={0.08} />
          </h2>
          <p className="mt-6 max-w-prose2 text-base text-paper/80">
            Плёночные снимки собраны в непрерывную световую плоскость. В затемнённом зале
            анатомия читается как чертёж — контуром, плотностью, тенью. Это самый тихий
            и самый неожиданный зал музея.
          </p>
          <p className="plaque mt-8 text-paper/50 md:hidden">
            На десктопе наведите курсор — снимок просветится
          </p>
        </div>
      </div>
    </section>
  );
}
