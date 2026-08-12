'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import { REVIEWS } from '@/lib/content';

/**
 * Отзывы — draggable-лента с инерцией. Тащится мышью и пальцем,
 * доступна с клавиатуры через обычный горизонтальный скролл-контейнер.
 */
export default function Reviews() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [bound, setBound] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      setBound(Math.max(0, track.current.scrollWidth - viewport.current.offsetWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section className="section bg-linen" aria-labelledby="reviews-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="plaque mb-6 text-azure">Отзывы · 05</p>
            <h2 id="reviews-title" className="max-w-[16ch] font-display text-h2 text-navy">
              <SplitText text="4,5 из 5 при 718 оценках" />
            </h2>
          </div>
          <p className="plaque text-slate/45">Потяните ленту вбок</p>
        </div>
      </div>

      <div ref={viewport} className="mt-14 overflow-hidden">
        <motion.div
          ref={track}
          drag="x"
          dragConstraints={{ left: -bound, right: 0 }}
          dragElastic={0.08}
          dragMomentum
          className="flex w-max cursor-grab gap-6 px-[var(--gutter)] active:cursor-grabbing"
        >
          {REVIEWS.map((review) => (
            <figure
              key={review.author}
              className="flex w-[min(84vw,420px)] shrink-0 flex-col justify-between border border-slate/12 bg-paper/50 p-8"
            >
              <blockquote className="font-quote text-lead text-navy/90">
                «{review.text}»
              </blockquote>
              <figcaption className="mt-8 flex items-baseline justify-between gap-4 border-t border-slate/12 pt-4">
                <span className="text-small text-slate/80">{review.author}</span>
                <span className="plaque text-slate/45">{review.role}</span>
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
