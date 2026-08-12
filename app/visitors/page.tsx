import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Faq from '@/components/visitors/Faq';
import Plate from '@/components/ui/Plate';
import SplitText from '@/components/ui/SplitText';
import { MUSEUM, VISITOR_RULES } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Посетителям',
  description:
    'Правила посещения музея анатомии, возрастные ограничения, условия съёмки, как добраться до Петроградского района и ответы на частые вопросы.',
  alternates: { canonical: '/visitors' },
};

export default function VisitorsPage() {
  return (
    <>
      <PageHero
        plaque="Зал 04 · Посетителям"
        title="Как здесь"
        accent="принято себя вести"
        lead="Ниже — не формальный регламент, а объяснение, почему музей устроен именно так. Это работающая кафедра: за стеной идёт занятие, а в витринах стоят предметы, которым больше ста лет."
        meta={[
          { label: 'Возраст', value: 'От 14 лет (14—17 с сопровождением)' },
          { label: 'Съёмка', value: 'Общие виды — да, крупные планы — по согласованию' },
        ]}
      />

      <section className="section pt-0" aria-labelledby="rules-title">
        <div className="shell">
          <h2 id="rules-title" className="sr-only">
            Правила посещения
          </h2>
          <div className="grid gap-px border border-slate/12 bg-slate/12 sm:grid-cols-2">
            {VISITOR_RULES.map((rule) => (
              <article key={rule.index} className="bg-paper p-8 lg:p-10">
                <p className="plaque text-azure/80">{rule.index}</p>
                <h3 className="mt-5 font-grotesk text-h4 text-navy">{rule.title}</h3>
                <p className="mt-4 max-w-prose2 text-small text-slate/70">{rule.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-linen" aria-labelledby="route-title">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <p className="plaque mb-6 text-azure">Маршрут</p>
            <h2 id="route-title" className="max-w-[14ch] font-display text-h2 text-navy">
              <SplitText text="Как добраться" />
            </h2>

            <dl className="mt-10 space-y-6 border-t border-slate/15 pt-8">
              <div>
                <dt className="plaque text-slate/45">Метро</dt>
                <dd className="mt-2 text-base text-navy">
                  {MUSEUM.metro} — далее пешком по территории университетского городка.
                </dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Адрес</dt>
                <dd className="mt-2 text-base text-navy">{MUSEUM.city}</dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Часы работы</dt>
                <dd className="mt-2 text-base text-navy">{MUSEUM.hours}</dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Доступность</dt>
                <dd className="mt-2 max-w-prose2 text-base text-slate/75">
                  Историческое здание с лестницами. Если нужна помощь в передвижении — сообщите
                  при записи, мы подберём маршрут и время без пересечения с учебными группами.
                </dd>
              </div>
            </dl>
          </div>

          <Plate
            src="/images/anatomy-8.jpg"
            alt="Экскурсионная группа у витрины с анатомическими муляжами"
            className="relative aspect-[4/5] w-full"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="faq-title" className="max-w-[16ch] font-display text-h2 text-navy">
              <SplitText text="Частые вопросы" />
            </h2>
            <p className="plaque max-w-[30ch] text-slate/45">
              Если ответа нет — напишите нам, мы отвечаем в рабочие дни
            </p>
          </div>

          <div className="mt-14">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
