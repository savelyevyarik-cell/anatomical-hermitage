'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  archive?: boolean;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

/**
 * Фотопластина с музейным цветокором и clip-path reveal
 * «снизу вверх» — как проявляющийся снимок.
 */
export default function Plate({
  src,
  alt,
  className = '',
  imgClassName = 'object-cover',
  archive = false,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  fill = true,
  width,
  height,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`plate ${archive ? 'plate-archive' : ''} ${className}`}
      initial={reduced ? undefined : { clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={reduced ? undefined : { clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        className={imgClassName}
      />
    </motion.div>
  );
}
