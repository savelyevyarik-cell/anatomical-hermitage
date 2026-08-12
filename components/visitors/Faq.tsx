'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQ } from '@/lib/content';

/** Аккордеон с кастомной иконкой-крестом и плавным раскрытием по высоте. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-slate/15">
      {FAQ.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q} className="border-b border-slate/15">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                className="flex w-full items-center justify-between gap-6 py-7 text-left transition-colors duration-300 hover:text-azure"
              >
                <span className="flex items-baseline gap-5">
                  <span className="plaque text-azure/70">{`0${i + 1}`}</span>
                  <span className="font-grotesk text-h4 text-navy">{item.q}</span>
                </span>

                <span aria-hidden className="relative block h-4 w-4 shrink-0">
                  <span className="absolute left-0 top-1/2 block h-px w-4 -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 block h-4 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-museum ${
                      expanded ? 'scale-y-0' : 'scale-y-100'
                    }`}
                  />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-prose2 pb-8 pl-0 text-base text-slate/75 sm:pl-12">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
