import type { Metadata } from 'next';
import SplitText from '@/components/ui/SplitText';
import MuseumMap from '@/components/contacts/MuseumMap';
import ContactForm from '@/components/contacts/ContactForm';
import { MUSEUM } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Как связаться с музеем анатомии ПСПбГМУ им. И. П. Павлова: телефон, почта, часы работы, схема расположения в Петроградском районе.',
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return (
    <>
      {/* Монументальная типографика вместо обычного заголовка страницы */}
      <section className="relative pb-16 pt-40 lg:pb-24 lg:pt-52">
        <div className="shell">
          <p className="plaque mb-10 text-azure">Зал 05 · Контакты</p>
          <h1 className="font-display text-mega leading-[0.85] text-navy">
            <SplitText text="Напишите" by="char" stagger={0.03} className="block" />
            <SplitText text="нам" by="char" stagger={0.03} delay={0.2} className="block text-azure" />
          </h1>
        </div>
      </section>

      <section className="section pt-0" aria-label="Контактные данные">
        <div className="shell grid gap-16 border-t border-slate/15 pt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div className="flex flex-col gap-12">
            <div>
              <p className="plaque mb-4 text-slate/45">Телефон</p>
              <a
                href={`tel:${MUSEUM.phone.replace(/[^+\dX]/g, '')}`}
                className="link-underline font-display text-h3 text-navy"
                data-cursor="Позвонить"
              >
                {MUSEUM.phone}
              </a>
            </div>

            <div>
              <p className="plaque mb-4 text-slate/45">Почта</p>
              <a
                href={`mailto:${MUSEUM.email}`}
                className="link-underline font-display text-h3 text-navy"
                data-cursor="Написать"
              >
                {MUSEUM.email}
              </a>
            </div>

            <div className="hairline" />

            <dl className="grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="plaque text-slate/45">Адрес</dt>
                <dd className="mt-3 text-base text-navy">{MUSEUM.city}</dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Метро</dt>
                <dd className="mt-3 text-base text-navy">{MUSEUM.metro}</dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Часы работы</dt>
                <dd className="mt-3 text-base text-navy">{MUSEUM.hours}</dd>
              </div>
              <div>
                <dt className="plaque text-slate/45">Билет</dt>
                <dd className="mt-3 text-base text-navy">от {MUSEUM.priceFrom} ₽</dd>
              </div>
            </dl>

            <p className="plaque max-w-[42ch] text-slate/40">
              Контактные данные на этой странице — плейсхолдеры учебного проекта.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="shell pb-[var(--section-y)]" aria-label="Схема расположения">
        <MuseumMap />
      </section>
    </>
  );
}
