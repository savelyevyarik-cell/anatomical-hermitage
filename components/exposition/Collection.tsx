'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, EXHIBITS, type Exhibit } from '@/lib/content';

/**
 * Сетка собрания с фильтрами. Перестройка идёт через layout-анимации
 * Framer Motion, лайтбокс подписан как музейная этикетка.
 */
export default function Collection() {
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<Exhibit | null>(null);

  const items = filter === 'all' ? EXHIBITS : EXHIBITS.filter((e) => e.category === filter);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [open]);

  return (
    <section className="section" aria-labelledby="collection-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2 id="collection-title" className="font-display text-h2 text-navy">
            Собрание
          </h2>
          <p className="plaque text-slate/45">{items.length} предметов в подборке</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3" role="group" aria-label="Фильтр по разделам">
          {CATEGORIES.map((cat) => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                aria-pressed={active}
                className={`plaque border px-5 py-3 transition-colors duration-300 ${
                  active
                    ? 'border-azure bg-azure/10 text-azure'
                    : 'border-slate/20 text-slate/65 hover:border-slate/50 hover:text-navy'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.button
                key={item.id}
                layout
                type="button"
                onClick={() => setOpen(item)}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col text-left"
                data-cursor="Открыть"
              >
                <div className="plate relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-museum group-hover:scale-105"
                  />
                </div>
                <p className="plaque mt-4 text-azure/80">{item.inventory}</p>
                <h3 className="mt-2 font-display text-h4 text-navy">{item.title}</h3>
                <p className="plaque mt-2 text-slate/45">{item.period}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-paper/95 p-[var(--gutter)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
          >
            <motion.div
              className="grid max-h-full w-full max-w-5xl gap-8 overflow-y-auto border border-slate/15 bg-linen p-6 lg:grid-cols-[1.2fr_1fr] lg:p-10"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="plate relative aspect-[4/3] w-full">
                <Image src={open.image} alt={open.alt} fill sizes="60vw" className="object-cover" />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="plaque text-azure">{open.inventory}</p>
                  <h3 className="mt-4 font-display text-h3 text-navy">{open.title}</h3>
                  <dl className="mt-6 space-y-3 border-t border-slate/15 pt-5">
                    <div className="flex justify-between gap-4">
                      <dt className="plaque text-slate/45">Датировка</dt>
                      <dd className="plaque text-right text-slate/85">{open.period}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="plaque text-slate/45">Техника</dt>
                      <dd className="plaque max-w-[60%] text-right text-slate/85">{open.technique}</dd>
                    </div>
                  </dl>
                  <p className="mt-6 text-small text-slate/80">{open.note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="plaque mt-8 w-fit btn-ghost px-5 py-3"
                >
                  Закрыть этикетку
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
