'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { TransitionLink } from './Transition';
import Magnetic from '@/components/ui/Magnetic';

export const NAV = [
  { href: '/exposition', title: 'Экспозиция', label: 'ЗАЛ 01 · ЭКСПОЗИЦИЯ' },
  { href: '/excursions', title: 'Экскурсии', label: 'ЗАЛ 02 · ЭКСКУРСИИ' },
  { href: '/history', title: 'История', label: 'ЗАЛ 03 · ИСТОРИЯ' },
  { href: '/visitors', title: 'Посетителям', label: 'ЗАЛ 04 · ПОСЕТИТЕЛЯМ' },
  { href: '/contacts', title: 'Контакты', label: 'ЗАЛ 05 · КОНТАКТЫ' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', open);
    return () => document.body.classList.remove('is-locked');
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:bg-navy focus:px-4 focus:py-2 focus:text-paper"
      >
        К основному содержанию
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-500 ease-museum ${
          scrolled || open ? 'bg-paper/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <TransitionLink
            href="/"
            label="ГЛАВНЫЙ ЗАЛ"
            className="group flex flex-col leading-none"
            aria-label="Анатомический эрмитаж — на главную"
          >
            <span className="font-display text-[1.15rem] tracking-tight text-navy">
              Анатомический эрмитаж
            </span>
            <span className="plaque mt-1 text-[10px] text-azure/80">
              ПСПбГМУ им. И. П. Павлова
            </span>
          </TransitionLink>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  className={`plaque link-underline py-1 transition-colors duration-300 ${
                    active ? 'text-azure' : 'text-slate/70 hover:text-navy'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.title}
                </TransitionLink>
              );
            })}

            <Magnetic strength={0.28}>
              <TransitionLink
                href="/excursions#booking"
                label="ЗАПИСЬ НА ЭКСКУРСИЮ"
                className="plaque inline-block btn-primary px-5 py-3"
              >
                Записаться
              </TransitionLink>
            </Magnetic>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="plaque flex items-center gap-3 text-slate lg:hidden"
          >
            {open ? 'Закрыть' : 'Меню'}
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
        <div className={`hairline transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-paper px-[var(--gutter)] pb-12 pt-24 lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="flex flex-col gap-2" aria-label="Мобильная навигация">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <TransitionLink
                    href={item.href}
                    label={item.label}
                    className="flex items-baseline gap-4 border-b border-slate/10 py-4"
                  >
                    <span className="plaque text-azure/70">{`0${i + 1}`}</span>
                    <span className="font-display text-h3 text-navy">{item.title}</span>
                  </TransitionLink>
                </motion.div>
              ))}
            </nav>

            <TransitionLink
              href="/excursions#booking"
              label="ЗАПИСЬ НА ЭКСКУРСИЮ"
              className="plaque mt-10 block btn-primary px-6 py-5 text-center"
            >
              Записаться на экскурсию
            </TransitionLink>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
