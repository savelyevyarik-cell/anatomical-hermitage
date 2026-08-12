'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { createElement, type ElementType } from 'react';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  by?: 'word' | 'char';
  delay?: number;
  stagger?: number;
  once?: boolean;
};

/**
 * Reveal заголовка по словам или буквам: каждый фрагмент выезжает
 * из-под маски. Анимируются только transform и opacity.
 */
export default function SplitText({
  text,
  as: Tag = 'span',
  className = '',
  by = 'word',
  delay = 0,
  stagger = 0.045,
  once = true,
}: Props) {
  const reduced = useReducedMotion();

  /**
   * Текст всегда режется сначала на слова и только потом — на буквы.
   * Иначе посимвольные inline-block'и позволяют браузеру перенести
   * строку в середине слова.
   */
  const words = text.split(' ').map((word) => (by === 'word' ? [word] : Array.from(word)));

  if (reduced) {
    return createElement(Tag, { className }, text);
  }

  const MotionTag: ElementType = motion(Tag as ElementType);

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-12% 0px -12% 0px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((chunks, wordIndex) => (
        <span
          key={`w-${wordIndex}`}
          aria-hidden
          style={{
            display: 'inline-block',
            // Слово целиком не переносится: разрыв возможен только между словами
            whiteSpace: 'nowrap',
            // Межсловный пробел задаём отступом: хвостовой пробел
            // внутри inline-block схлопывается
            marginRight: wordIndex < words.length - 1 ? '0.26em' : undefined,
          }}
        >
          {chunks.map((part, i) => (
            <span
              key={`${part}-${i}`}
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'bottom',
                // Маска шире строки: иначе она срезает выносные «у», «р», «д»
                // и правые свесы антиквы. Компенсируем отрицательными полями.
                paddingBottom: '0.24em',
                marginBottom: '-0.24em',
                paddingRight: '0.06em',
                marginRight: '-0.06em',
              }}
            >
              <motion.span
                style={{ display: 'inline-block', willChange: 'transform' }}
                variants={{
                  hidden: { y: '110%', opacity: 0 },
                  visible: { y: '0%', opacity: 1 },
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {part}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </MotionTag>
  );
}
