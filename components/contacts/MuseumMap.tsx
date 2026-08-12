'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Схема района вместо картографического сервиса: светлая, в палитре
 * сайта, без внешних запросов и без точного адреса. Рисуется линиями —
 * так же, как рентгеновский снимок.
 */
export default function MuseumMap() {
  const reduced = useReducedMotion();
  const mono = 'var(--font-mono), monospace';

  return (
    <figure className="relative w-full overflow-hidden border border-slate/15 bg-linen">
      <svg
        viewBox="0 0 800 520"
        className="h-auto w-full"
        role="img"
        aria-label="Схема расположения музея в Петроградском районе Санкт-Петербурга"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(19,41,75,0.07)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="520" fill="#F7F3EA" />
        <rect width="800" height="520" fill="url(#grid)" />

        {/* Нева */}
        <path
          d="M-20 400 C 140 350, 260 430, 420 380 S 700 300, 830 340 L 830 540 L -20 540 Z"
          fill="#DCEAF4"
          stroke="rgba(46,107,170,0.45)"
          strokeWidth="1.5"
        />

        {/* Проспекты */}
        <path d="M60 40 L 300 500" stroke="rgba(19,41,75,0.2)" strokeWidth="2" fill="none" />
        <path d="M320 -10 L 470 500" stroke="rgba(19,41,75,0.2)" strokeWidth="2" fill="none" />
        <path d="M0 190 L 800 150" stroke="rgba(19,41,75,0.2)" strokeWidth="2" fill="none" />
        <path d="M120 300 L 800 250" stroke="rgba(19,41,75,0.12)" strokeWidth="1.5" fill="none" />

        {/* Университетский квартал */}
        <rect
          x="330"
          y="140"
          width="180"
          height="130"
          fill="rgba(46,107,170,0.1)"
          stroke="rgba(46,107,170,0.55)"
          strokeWidth="1.5"
        />
        <text x="340" y="130" fill="#4C637C" fontSize="13" letterSpacing="2" fontFamily={mono}>
          УНИВЕРСИТЕТСКИЙ ГОРОДОК
        </text>

        {/* Метро */}
        <circle cx="205" cy="178" r="7" fill="none" stroke="#2E6BAA" strokeWidth="2" />
        <text x="220" y="183" fill="#4C637C" fontSize="13" letterSpacing="1.5" fontFamily={mono}>
          М. «ПЕТРОГРАДСКАЯ»
        </text>

        {/* Пеший маршрут */}
        <path
          d="M205 178 C 260 195, 300 200, 400 205"
          stroke="#2E6BAA"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Точка музея */}
        <g>
          {!reduced ? (
            <motion.circle
              cx="400"
              cy="205"
              r="10"
              fill="none"
              stroke="#2E6BAA"
              strokeWidth="1.5"
              animate={{ r: [10, 30], opacity: [0.6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />
          ) : null}
          <circle cx="400" cy="205" r="6" fill="#13294B" />
          <text x="416" y="210" fill="#13294B" fontSize="14" letterSpacing="1.5" fontFamily={mono}>
            АНАТОМИЧЕСКИЙ ЭРМИТАЖ
          </text>
        </g>
      </svg>

      <figcaption className="plaque border-t border-slate/15 px-6 py-4 text-slate/60">
        Схема условная. Точный адрес и корпус сообщаем при подтверждении записи.
      </figcaption>
    </figure>
  );
}
