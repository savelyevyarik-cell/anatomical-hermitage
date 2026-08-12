import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import Collection from '@/components/exposition/Collection';
import ExplorerMount from '@/components/exposition/ExplorerMount';

export const metadata: Metadata = {
  title: 'Экспозиция',
  description:
    'Разделы собрания: костные экспозиции, влажные препараты, восковые и гипсовые муляжи, эмбриологическая коллекция и рентгенологический зал.',
  alternates: { canonical: '/exposition' },
};

export default function ExpositionPage() {
  return (
    <>
      <PageHero
        plaque="Зал 01 · Экспозиция"
        title="Собрание,"
        accent="разобранное по системам"
        lead="Экспозиция построена не по красоте предметов, а по логике анатомического курса: от отдельной кости к системе органов и к их изображению на просвет. Ниже — интерактивная схема: точки открывают разделы собрания."
        meta={[
          { label: 'Разделов', value: 'Пять основных' },
          { label: 'Показ', value: 'Только с экскурсоводом' },
        ]}
      />

      <section className="shell pb-[var(--section-y)]" aria-label="Интерактивная схема собрания">
        <ExplorerMount />
      </section>

      <Collection />
    </>
  );
}
