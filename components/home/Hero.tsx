'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Magnetic from '@/components/ui/Magnetic';
import { TransitionLink } from '@/components/layout/Transition';
import SceneFallback from '@/components/three/SceneFallback';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* На мобильном сцена приглушена: текст важнее объекта */}
      <div className="absolute inset-0 opacity-45 md:opacity-100" aria-hidden>
        <HeroScene />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-paper/70" />
      </div>

      <div className="shell relative z-10 pb-14 pt-32">
        <motion.p
          className="plaque mb-8 text-azure"
          initial={reduced ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Музей анатомии ПСПбГМУ им. И. П. Павлова · собрание с 1897 года
        </motion.p>

        <h1 className="max-w-[16ch] font-display text-h1 text-navy">
          <SplitText text="Анатомия," by="char" stagger={0.028} className="block" />
          <SplitText
            text="увиденная на свет"
            by="char"
            stagger={0.022}
            delay={0.25}
            className="block text-azure"
          />
        </h1>

        <div className="mt-12 grid gap-10 border-t border-slate/15 pt-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <p className="max-w-prose2 text-base text-slate/80">
            Влажные препараты и костные экспозиции, восковые муляжи, эмбриологическая коллекция
            и зал, стены которого целиком выложены подсвеченными рентгеновскими снимками.
            Музей работает при действующей кафедре — попасть сюда можно только по записи
            и только в будний день.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <Magnetic strength={0.3}>
              <TransitionLink
                href="/excursions#booking"
                label="ЗАПИСЬ НА ЭКСКУРСИЮ"
                className="plaque inline-block btn-primary px-7 py-4"
                data-cursor="Записаться"
              >
                Записаться на экскурсию
              </TransitionLink>
            </Magnetic>
            <Magnetic strength={0.22}>
              <TransitionLink
                href="/exposition"
                label="ЗАЛ 01 · ЭКСПОЗИЦИЯ"
                className="plaque link-underline inline-block py-4 text-slate/80 hover:text-navy"
              >
                Смотреть собрание
              </TransitionLink>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="shell relative z-10 flex items-center justify-between pb-8">
        <span className="plaque text-slate/40">Прокрутите вниз</span>
        <motion.span
          aria-hidden
          className="block h-10 w-px bg-slate/30"
          animate={reduced ? undefined : { scaleY: [0.2, 1, 0.2], originY: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="plaque text-slate/40">01 / 06</span>
      </div>
    </section>
  );
}
