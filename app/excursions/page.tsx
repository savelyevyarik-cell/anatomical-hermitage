import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import BookingForm from '@/components/excursions/BookingForm';
import SplitText from '@/components/ui/SplitText';
import { FORMATS, MUSEUM } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Экскурсии',
  description:
    'Форматы посещения музея анатомии: студенческие и школьные группы, сборные и индивидуальные экскурсии, англоязычные группы. Билет от 400 ₽, только по предварительной записи.',
  alternates: { canonical: '/excursions' },
};

export default function ExcursionsPage() {
  return (
    <>
      <PageHero
        plaque="Зал 02 · Экскурсии"
        title="Пять форматов"
        accent="одного маршрута"
        lead="Мы не делаем разных экспозиций для разных гостей — меняется глубина разговора и состав залов. Школьная группа не заходит в эмбриологический раздел, студенческая разбирает препараты по системам, индивидуальный визит идёт в свободном темпе."
        meta={[
          { label: 'Билет', value: `от ${MUSEUM.priceFrom} ₽` },
          { label: 'Расписание', value: 'Пн — Пт, по записи' },
        ]}
      />

      {/* Акцент-блок: главное ограничение музея */}
      <section className="border-y border-azure/25 bg-mist" aria-label="Условия посещения">
        <div className="shell grid gap-8 py-14 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
          <p className="plaque whitespace-nowrap text-azure">Важно · 01</p>
          <p className="max-w-[46ch] font-display text-h3 text-navy">
            Только по предварительной записи и только в рабочие дни. Без записи в музей попасть
            нельзя — залы одновременно являются учебными помещениями кафедры.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="formats-title">
        <div className="shell">
          <h2 id="formats-title" className="max-w-[16ch] font-display text-h2 text-navy">
            <SplitText text="Кому и как мы показываем собрание" />
          </h2>

          <div className="mt-14 border-t border-slate/15">
            {FORMATS.map((format, i) => (
              <article
                key={format.id}
                className="group grid gap-4 border-b border-slate/15 py-8 transition-colors duration-500 hover:bg-linen/60 lg:grid-cols-[auto_1.1fr_1fr] lg:items-start lg:gap-10 lg:px-6"
                data-cursor={format.duration}
              >
                <span className="plaque text-azure/80">{`0${i + 1}`}</span>

                <div>
                  <h3 className="font-display text-h3 text-navy">{format.title}</h3>
                  <p className="plaque mt-3 text-slate/50">{format.audience}</p>
                </div>

                <div>
                  <dl className="flex flex-wrap gap-x-8 gap-y-2">
                    <div className="flex gap-2">
                      <dt className="plaque text-slate/40">Длительность</dt>
                      <dd className="plaque text-slate/85">{format.duration}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="plaque text-slate/40">Группа</dt>
                      <dd className="plaque text-slate/85">{format.group}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="plaque text-slate/40">Стоимость</dt>
                      <dd className="plaque text-azure">{format.price}</dd>
                    </div>
                  </dl>

                  {/* Раскрытие описания на hover, на тач-устройствах текст виден всегда */}
                  <p className="mt-4 max-w-prose2 text-small text-slate/70 lg:mt-0 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-700 lg:ease-museum lg:group-hover:mt-4 lg:group-hover:max-h-40 lg:group-hover:opacity-100">
                    {format.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="section bg-linen" aria-labelledby="booking-title">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <p className="plaque mb-6 text-azure">Запись</p>
            <h2 id="booking-title" className="font-display text-h2 text-navy">
              <SplitText text="Заявка на визит" />
            </h2>
            <p className="mt-6 max-w-prose2 text-base text-slate/75">
              Заполните три шага — мы сверим дату с расписанием занятий кафедры и предложим точное
              время. Ответ приходит в рабочее время, обычно в течение одного дня.
            </p>
            <p className="plaque mt-8 text-slate/45">
              Телефон {MUSEUM.phone} · {MUSEUM.email}
            </p>
          </div>

          <BookingForm />
        </div>
      </section>
    </>
  );
}
