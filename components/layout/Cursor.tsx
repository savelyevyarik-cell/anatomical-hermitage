'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Курсор-визир: тонкая рамка-уголки, как рамка кадрирования на
 * музейной фотофиксации. Появляется только над элементами, у которых
 * есть data-cursor, и несёт подпись действия.
 *
 * Системный указатель НЕ скрывается: он остаётся точкой отсчёта,
 * а визир работает как подсказка, а не как замена курсору.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    setEnabled(true);

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);

      const target = (event.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      setLabel(target?.dataset?.cursor ?? null);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  if (!enabled) return null;

  const corner = 'absolute h-3 w-3 border-azure';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <AnimatePresence>
        {label ? (
          <motion.div
            style={{ x: sx, y: sy }}
            className="absolute left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Рамка кадрирования: четыре уголка, раскрывающиеся из центра */}
            <motion.div
              className="relative -translate-x-1/2 -translate-y-1/2"
              initial={{ width: 26, height: 26 }}
              animate={{ width: 64, height: 64 }}
              exit={{ width: 26, height: 26 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <span className={`${corner} left-0 top-0 border-l border-t`} />
              <span className={`${corner} right-0 top-0 border-r border-t`} />
              <span className={`${corner} bottom-0 left-0 border-b border-l`} />
              <span className={`${corner} bottom-0 right-0 border-b border-r`} />
            </motion.div>

            <motion.span
              className="plaque absolute left-11 top-6 whitespace-nowrap bg-navy px-2 py-1 text-[10px] text-paper"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {label}
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
