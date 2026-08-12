'use client';

import { TransitionLink } from './Transition';
import { NAV } from './Header';
import { MUSEUM } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="border-t border-slate/10 bg-paper">
      <div className="shell py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-h3 text-navy">Анатомический эрмитаж</p>
            <p className="mt-4 max-w-prose2 text-small text-slate/60">
              {MUSEUM.legal}. Собрание работает при действующей {MUSEUM.department.toLowerCase()},
              поэтому посещение возможно только по предварительной записи и только в рабочие дни.
            </p>
          </div>

          <nav aria-label="Навигация в подвале" className="flex flex-col gap-3">
            <p className="plaque mb-2 text-azure/70">Разделы</p>
            {NAV.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                label={item.label}
                className="link-underline w-fit text-small text-slate/75 hover:text-navy"
              >
                {item.title}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <p className="plaque mb-2 text-azure/70">Контакты</p>
            <a href={`tel:${MUSEUM.phone.replace(/[^+\dX]/g, '')}`} className="link-underline w-fit text-small text-slate/75">
              {MUSEUM.phone}
            </a>
            <a href={`mailto:${MUSEUM.email}`} className="link-underline w-fit text-small text-slate/75">
              {MUSEUM.email}
            </a>
            <p className="text-small text-slate/60">{MUSEUM.city}</p>
            <p className="text-small text-slate/60">{MUSEUM.metro}</p>
            <p className="text-small text-slate/60">{MUSEUM.hours}</p>
          </div>
        </div>

        <div className="hairline mt-16" />

        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
          <p className="plaque text-slate/40">
            © {new Date().getFullYear()} Анатомический эрмитаж
          </p>
          <p className="plaque text-slate/40">
            Учебный дизайн-проект · контактные данные заменены плейсхолдерами
          </p>
        </div>
      </div>
    </footer>
  );
}
