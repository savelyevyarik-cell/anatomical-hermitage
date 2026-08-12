'use client';

import SplitText from '@/components/ui/SplitText';
import Magnetic from '@/components/ui/Magnetic';
import { TransitionLink } from '@/components/layout/Transition';
import { MUSEUM } from '@/lib/content';

export default function Cta() {
  return (
    <section className="room-deep section" aria-labelledby="cta-title">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="plaque mb-6 text-sky">Визит · 06</p>
            <h2 id="cta-title" className="max-w-[15ch] font-display text-h2">
              <SplitText text="Попасть сюда" className="block" />
              <SplitText text="можно только по записи" className="block text-sky" delay={0.08} />
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <p className="max-w-prose2 text-base text-paper/75">
              Залы музея — одновременно учебные помещения кафедры. Поэтому мы принимаем группы
              только в будние дни и только по предварительной договорённости. Билет — от{' '}
              {MUSEUM.priceFrom} ₽.
            </p>
            <Magnetic strength={0.28}>
              <TransitionLink
                href="/excursions#booking"
                label="ЗАПИСЬ НА ЭКСКУРСИЮ"
                className="plaque inline-block bg-paper px-8 py-5 text-navy transition-colors duration-300 hover:bg-sky"
                data-cursor="Записаться"
              >
                Записаться на экскурсию
              </TransitionLink>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
