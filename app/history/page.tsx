import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Timeline from '@/components/history/Timeline';
import Plate from '@/components/ui/Plate';
import SplitText from '@/components/ui/SplitText';

export const metadata: Metadata = {
  title: 'История',
  description:
    'От основания кафедры нормальной анатомии в 1897 году до сегодняшнего дня: как складывалось собрание Анатомического эрмитажа и кто его сохранял.',
  alternates: { canonical: '/history' },
};

export default function HistoryPage() {
  return (
    <>
      <PageHero
        plaque="Зал 03 · История"
        title="Собрание,"
        accent="которому почти два века"
        lead="Музей не создавался как музей. Он вырос из рабочих шкафов кафедры: препараты, изготовленные для занятий, постепенно перестали умещаться в лаборатории и переехали в витрины. Этой логике — «сначала польза, потом экспозиция» — собрание следует до сих пор."
        meta={[
          { label: 'Основание', value: '1897 год' },
          { label: 'Статус', value: 'Действующая кафедра' },
        ]}
      />

      <section className="section pt-0" aria-label="Хронология музея">
        <div className="shell">
          <Timeline />
        </div>
      </section>

      <section className="room-deep section" aria-labelledby="keepers-title">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <Plate
            src="/images/anatomy-5.jpg"
            alt="Хранитель музея на фоне стены рентгеновских снимков"
            className="relative aspect-[3/4] w-full"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />

          <div>
            <p className="plaque mb-6 text-sky">Хранители</p>
            <h2 id="keepers-title" className="max-w-[16ch] font-display text-h2">
              <SplitText text="Собрание держится" className="block" />
              <SplitText text="на нескольких людях" className="block text-sky" delay={0.08} />
            </h2>
            <p className="mt-8 max-w-prose2 text-base text-paper/80">
              Хранитель здесь — не административная должность, а преподаватель кафедры, который знает
              каждый препарат по инвентарному номеру и по истории поступления. Он же чинит витрины,
              переписывает выцветшие этикетки и водит экскурсии.
            </p>
            <p className="mt-6 max-w-prose2 font-quote text-lead italic text-paper/70">
              «Мы не имеем права относиться к этому как к имуществу. Это результат чьей-то работы
              и чьей-то жизни — и то и другое требует бережности».
            </p>
            <p className="plaque mt-6 text-sky">Из беседы с хранителем собрания</p>
          </div>
        </div>
      </section>
    </>
  );
}
