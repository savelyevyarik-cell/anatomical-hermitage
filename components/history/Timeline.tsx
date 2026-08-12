'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Plate from '@/components/ui/Plate';
import { TIMELINE } from '@/lib/content';

/**
 * Вертикальный scroll-timeline. Линия рисуется по мере прокрутки
 * через stroke-dashoffset, архивные кадры едут с иным темпом,
 * чем текст, — отсюда ощущение глубины.
 */
export default function Timeline() {
  const root = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ['start 0.8', 'end 0.4'],
  });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <div ref={root} className="relative">
      {/* Линия времени */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-[max(var(--gutter),1.25rem)] top-0 h-full w-px overflow-visible lg:left-1/2"
        preserveAspectRatio="none"
        viewBox="0 0 1 100"
      >
        <line x1="0.5" y1="0" x2="0.5" y2="100" stroke="rgba(19,41,75,0.14)" strokeWidth="1" />
        <motion.line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100"
          stroke="#2E6BAA"
          strokeWidth="1.5"
          style={{ pathLength: draw }}
        />
      </svg>

      <ol className="relative flex flex-col gap-20 lg:gap-24">
        {TIMELINE.map((item, i) => (
          <TimelineItem key={item.year} item={item} index={i} />
        ))}
      </ol>
    </div>
  );
}

function TimelineItem({
  item,
  index,
}: {
  item: (typeof TIMELINE)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const left = index % 2 === 0;

  return (
    <li
      ref={ref}
      className={`relative pl-14 lg:grid lg:grid-cols-2 lg:gap-20 lg:pl-0 ${
        left ? '' : 'lg:[&>*:first-child]:order-2'
      }`}
    >
      {/* Узел на линии */}
      <span
        aria-hidden
        className="absolute left-[max(var(--gutter),1.25rem)] top-2 -ml-[5px] block h-2.5 w-2.5 rounded-full bg-azure lg:left-1/2"
      />

      <div className={left ? 'lg:pr-16 lg:text-right' : 'lg:col-start-2 lg:pl-16'}>
        <p className="plaque text-azure">{item.year}</p>
        <h3 className="mt-4 font-display text-h3 text-navy">{item.title}</h3>
        <p className="mt-5 max-w-prose2 text-base text-slate/75 lg:ml-auto">{item.text}</p>
      </div>

      {item.image ? (
        <motion.div style={{ y }} className={left ? 'mt-8 lg:col-start-2 lg:mt-0 lg:pl-16' : 'mt-8 lg:mt-0 lg:pr-16'}>
          <Plate
            src={item.image}
            alt={item.alt}
            archive={index === 0}
            className="relative aspect-[4/3] w-full"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <p className="plaque mt-3 text-slate/50">Архив музея · {item.year}</p>
        </motion.div>
      ) : null}
    </li>
  );
}
