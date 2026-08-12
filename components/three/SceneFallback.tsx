/**
 * Graceful fallback: если WebGL недоступен или 3D ещё грузится —
 * рисуем схему грудной клетки средствами SVG. Тот же силуэт,
 * та же холодная подсветка, нулевая стоимость.
 */
export default function SceneFallback() {
  const ribs = Array.from({ length: 10 });

  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <svg viewBox="0 0 320 420" className="h-[72%] w-auto opacity-70" role="presentation">
        <defs>
          <linearGradient id="rib-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E6BAA" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#8CC0E4" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Позвоночный столб */}
        <line
          x1="160"
          y1="34"
          x2="160"
          y2="392"
          stroke="url(#rib-stroke)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Грудина */}
        <line
          x1="160"
          y1="96"
          x2="160"
          y2="236"
          stroke="url(#rib-stroke)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />

        {ribs.map((_, i) => {
          const t = i / (ribs.length - 1);
          const y = 72 + i * 27;
          // Полуразмах ребра: шире в середине клетки, уже сверху и снизу
          const w = 30 + Math.sin(t * Math.PI) * 74;
          const drop = 34 + t * 8; // передний конец ребра опускается ниже заднего

          // Каждое ребро — крючок: от позвоночника наружу и вниз к грудине
          const rib = (dir: number) =>
            `M160 ${y} C ${160 + dir * w} ${y + 2}, ${160 + dir * w * 1.02} ${y + drop * 0.7}, ${
              160 + dir * w * 0.3
            } ${y + drop}`;

          return (
            <g key={i}>
              <path
                d={rib(-1)}
                fill="none"
                stroke="url(#rib-stroke)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={rib(1)}
                fill="none"
                stroke="url(#rib-stroke)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
