'use client';

import SplitText from '@/components/ui/SplitText';
import Counter from '@/components/ui/Counter';
import { STATS } from '@/lib/content';

export default function Manifesto() {
  return (
    <section className="room-deep section" aria-labelledby="manifesto-title">
      <div className="shell">
        <p className="plaque mb-10 text-sky">Манифест · 02</p>

        <h2 id="manifesto-title" className="max-w-[18ch] font-display text-h2">
          <SplitText text="Мы не показываем" className="block" />
          <SplitText text="страшное. Мы показываем" className="block" delay={0.08} />
          <SplitText text="устройство." className="block text-sky" delay={0.16} />
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <p className="max-w-prose2 text-base text-paper/80">
            Анатомический эрмитаж — не кабинет редкостей и не аттракцион. Это учебное собрание,
            которому почти два века и которое продолжает работать по прямому назначению: по этим
            препаратам учатся врачи. Мы просим смотреть на них так, как смотрит анатом, —
            внимательно и без спешки.
          </p>
          <p className="max-w-prose2 font-quote text-lead italic text-paper/70">
            «Здесь нет ничего, что не было бы правдой о человеческом теле. Единственная драматургия,
            которую мы себе позволяем, — это свет».
            <span className="plaque mt-4 block not-italic text-sky">Из кураторского текста</span>
          </p>
        </div>

        <div className="hairline mt-16" />

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-t border-paper/15 pt-5">
              <dd className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-paper">
                <Counter value={stat.value} />
              </dd>
              <dt className="plaque mt-4 text-paper/70">{stat.label}</dt>
              <p className="mt-2 text-small text-paper/50">{stat.hint}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
