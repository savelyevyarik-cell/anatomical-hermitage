'use client';

import dynamic from 'next/dynamic';
import SplitText from '@/components/ui/SplitText';
import Magnetic from '@/components/ui/Magnetic';
import { TransitionLink } from '@/components/layout/Transition';

const LostExhibit = dynamic(() => import('@/components/three/LostExhibit'), { ssr: false });

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <LostExhibit />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-paper/60" />
      </div>

      <div className="shell relative z-10 pb-20 pt-40">
        <p className="plaque mb-8 text-azure">ИНВ. 404 · местонахождение не установлено</p>

        <h1 className="max-w-[16ch] font-display text-h1 text-navy">
          <SplitText text="Экспонат" by="char" stagger={0.03} className="block" />
          <SplitText text="не найден" by="char" stagger={0.03} delay={0.18} className="block text-azure" />
        </h1>

        <p className="mt-10 max-w-prose2 text-base text-slate/80">
          Такой страницы в собрании нет — возможно, ссылка устарела или в адресе опечатка.
          Сосуд на этом месте пуст, а карточка осталась.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Magnetic strength={0.3}>
            <TransitionLink
              href="/"
              label="ГЛАВНЫЙ ЗАЛ"
              className="plaque inline-block btn-primary px-7 py-4"
            >
              Вернуться в главный зал
            </TransitionLink>
          </Magnetic>
          <Magnetic strength={0.22}>
            <TransitionLink
              href="/exposition"
              label="ЗАЛ 01 · ЭКСПОЗИЦИЯ"
              className="plaque link-underline inline-block py-4 text-slate/80 hover:text-navy"
            >
              К экспозиции
            </TransitionLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
