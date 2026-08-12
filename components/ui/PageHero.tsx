'use client';

import { motion, useReducedMotion } from 'framer-motion';
import SplitText from './SplitText';

/**
 * Титульный экран внутренней страницы. Держит единый ритм:
 * моно-этикетка зала, крупный антиква-заголовок, лид и метаданные.
 */
export default function PageHero({
  plaque,
  title,
  accent,
  lead,
  meta = [],
}: {
  plaque: string;
  title: string;
  accent?: string;
  lead: string;
  meta?: { label: string; value: string }[];
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-40 lg:pb-24 lg:pt-52">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-40"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 0%, rgba(191,216,230,0.16) 0%, transparent 70%), radial-gradient(40% 50% at 90% 10%, rgba(110,18,32,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="shell relative">
        <motion.p
          className="plaque mb-8 text-azure"
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {plaque}
        </motion.p>

        <h1 className="max-w-[15ch] font-display text-h1 text-navy">
          <SplitText text={title} by="char" stagger={0.024} className="block" />
          {accent ? (
            <SplitText
              text={accent}
              by="char"
              stagger={0.02}
              delay={0.2}
              className="block text-azure"
            />
          ) : null}
        </h1>

        <div className="mt-12 grid gap-10 border-t border-slate/15 pt-8 lg:grid-cols-[1.2fr_1fr]">
          <p className="max-w-prose2 text-base text-slate/80">{lead}</p>

          {meta.length ? (
            <dl className="grid grid-cols-2 gap-6 self-start">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="plaque text-slate/45">{item.label}</dt>
                  <dd className="mt-2 text-small text-navy">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
