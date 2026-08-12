'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Plate from '@/components/ui/Plate';
import SplitText from '@/components/ui/SplitText';
import { HALLS } from '@/lib/content';

/**
 * «Залы музея» — pinned horizontal scroll. На десктопе секция
 * закрепляется и карточки едут вбок; на планшете и мобильном
 * это обычная вертикальная лента (переосмысление, а не сжатие).
 */
export default function Halls() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        },
        () => {
          const el = track.current;
          if (!el) return;
          const distance = () => el.scrollWidth - window.innerWidth + 96;

          const tween = gsap.to(el, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: () => `+=${distance() + window.innerHeight * 0.5}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-paper" aria-labelledby="halls-title">
      <div className="shell pt-[var(--section-y)]">
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
      </div>

      <div className="mt-16 pb-[var(--section-y)] lg:mt-20">
        <div
          ref={track}
          className="flex flex-col gap-10 px-[var(--gutter)] lg:w-max lg:flex-row lg:gap-8 lg:will-change-transform"
        >
          {HALLS.map((hall) => (
            <article
              key={hall.index}
              className="group relative flex w-full flex-col lg:h-[62vh] lg:w-[clamp(340px,32vw,520px)]"
              data-cursor={hall.latin}
            >
              <div className="plate relative h-[52vh] w-full overflow-hidden lg:h-full">
                <Plate
                  src={hall.image}
                  alt={hall.alt}
                  className="absolute inset-0"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  imgClassName="object-cover transition-transform duration-[900ms] ease-museum group-hover:scale-[1.06]"
                />
                {/* Плотная светлая подложка снизу — этикетка должна читаться на любом кадре */}
                <div className="absolute inset-0 z-[3] bg-gradient-to-t from-paper via-paper/85 via-40% to-transparent" />

                <div className="absolute inset-x-0 bottom-0 z-[4] p-6 lg:p-7">
                  <div className="flex items-baseline gap-4">
                    <span className="plaque text-azure">{hall.index}</span>
                    <span className="plaque text-slate/50">{hall.latin}</span>
                  </div>
                  <h3 className="mt-3 font-display text-h3 text-navy">{hall.title}</h3>
                  <p className="mt-3 max-w-[40ch] text-small text-slate/75">{hall.summary}</p>

                  {/* Раскрытие на hover — только там, где есть указатель */}
                  <p className="mt-0 max-h-0 overflow-hidden text-small text-slate/60 opacity-0 transition-all duration-700 ease-museum group-hover:mt-4 group-hover:max-h-40 group-hover:opacity-100">
                    {hall.detail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
