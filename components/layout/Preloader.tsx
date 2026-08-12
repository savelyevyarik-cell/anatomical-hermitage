'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Прелоадер как титульная карточка экспоната: инвентарный номер,
 * название музея и счётчик. Показывается один раз за сессию.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('ah-preloaded') === '1') return;
    if (reduced) {
      sessionStorage.setItem('ah-preloaded', '1');
      return;
    }

    setVisible(true);
    document.body.classList.add('is-locked');

    const start = performance.now();
    const total = 1900;
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / total, 1);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem('ah-preloaded', '1');
        window.setTimeout(() => {
          setVisible(false);
          document.body.classList.remove('is-locked');
        }, 260);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove('is-locked');
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-paper px-[var(--gutter)] py-8"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-start justify-between">
            <span className="plaque text-azure">ИНВ. 00-А-001</span>
            <span className="plaque text-slate/50">Санкт-Петербург</span>
          </div>

          <div className="flex flex-col gap-6">
            <div className="hairline" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h1 className="font-display text-h2 leading-[0.95] text-navy">
                Анатомический
                <br />
                эрмитаж
              </h1>
              <span className="plaque text-[clamp(2rem,7vw,5rem)] leading-none tracking-normal text-azure">
                {progress}
              </span>
            </div>
            <motion.div
              className="h-px origin-left bg-azure/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>

          <span className="plaque max-w-prose2 text-slate/45">
            Музей анатомии ПСПбГМУ им. И. П. Павлова · собрание открыто для посещения
            по предварительной записи
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
