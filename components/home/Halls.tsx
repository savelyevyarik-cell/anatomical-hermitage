'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Plate from '@/components/ui/Plate';
import SplitText from '@/components/ui/SplitText';
import { HALLS } from '@/lib/content';

/**
 * «Залы музея» — свободная редакционная сетка.
 *
 * Раньше здесь был pinned horizontal scroll: секция перехватывала
 * прокрутку и держала страницу, пока карточки едут вбок. Это давало
 * рывки (pin пересчитывает layout на каждом кадре) и не давало просто
 * пролистать блок. Теперь каждая карточка живёт независимо: своя
 * позиция в сетке, свой вертикальный сдвиг и свой триггер появления.
 * Скролл страницы остаётся обычным.
 */

// Раскладка на десктопе: колонка старта, ширина, вертикальный сдвиг, пропорции кадра
const LAYOUT = [
  { col: 'lg:col-start-1 lg:col-span-6', offset: 'lg:mt-0', ratio: 'lg:aspect-[4/5]' },
  { col: 'lg:col-start-8 lg:col-span-5', offset: 'lg:mt-24', ratio: 'lg:aspect-[3/4]' },
  { col: 'lg:col-start-2 lg:col-span-7', offset: 'lg:-mt-16', ratio: 'lg:aspect-[16/10]' },
  { col: 'lg:col-start-9 lg:col-span-4', offset: 'lg:mt-8', ratio: 'lg:aspect-[3/4]' },
  { col: 'lg:col-start-3 lg:col-span-6', offset: 'lg:mt-0', ratio: 'lg:aspect-[4/5]' },
];

export default function Halls() {
  const reduced = useReducedMotion();

  return (
    <section className="section bg-paper" aria-labelledby="halls-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="plaque mb-6 text-azure">Маршрут · 03</p>
            <h2 id="halls-title" className="max-w-[14ch] font-display text-h2 text-navy">
              <SplitText text="Пять залов," className="block" />
              <SplitText text="пять способов смотреть" className="block text-azure" delay={0.08} />
            </h2>
          </div>
          <p className="plaque max-w-[34ch] text-slate/50">
            Экскурсия идёт последовательно: от отдельной кости к целому организму
            и к его изображению на просвет
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-28">
          {HALLS.map((hall, i) => {
            const layout = LAYOUT[i] ?? LAYOUT[0];
            return (
              <motion.article
                key={hall.index}
                className={`group flex flex-col ${layout.col} ${layout.offset}`}
                initial={reduced ? undefined : { opacity: 0, y: 48 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                data-cursor={hall.latin}
              >
                <div className={`plate relative aspect-[4/5] w-full overflow-hidden ${layout.ratio}`}>
                  <Plate
                    src={hall.image}
                    alt={hall.alt}
                    className="absolute inset-0"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    imgClassName="object-cover transition-transform duration-[900ms] ease-museum group-hover:scale-[1.05]"
                  />
                </div>

                <div className="mt-6 flex flex-col">
                  <div className="flex items-baseline gap-4">
                    <span className="plaque text-azure">{hall.index}</span>
                    <span className="plaque text-slate/50">{hall.latin}</span>
                  </div>
                  <h3 className="mt-3 font-display text-h3 text-navy">{hall.title}</h3>
                  <p className="mt-3 max-w-[46ch] text-small text-slate/75">{hall.summary}</p>
                  <p className="mt-3 max-w-[46ch] text-small text-slate/55">{hall.detail}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
