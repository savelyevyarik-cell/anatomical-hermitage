'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Переход между страницами оформлен как переход из зала в зал:
 * тёмная шторка закрывает кадр, на ней проступает моно-подпись зала,
 * затем шторка уходит вверх уже на новой странице.
 *
 * App Router не даёт надёжных exit-анимаций для страниц, поэтому
 * шторка живёт в layout и управляется вручную: закрытие по клику,
 * открытие — по смене pathname.
 */

type Ctx = { navigate: (href: string, label?: string) => void };
const TransitionCtx = createContext<Ctx>({ navigate: () => {} });

export function useTransition() {
  return useContext(TransitionCtx);
}

const DURATION = 0.62;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [covering, setCovering] = useState(false);
  const [label, setLabel] = useState('');
  const pendingRef = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string, nextLabel = '') => {
      if (href === pathname) return;
      if (reduced) {
        router.push(href);
        return;
      }
      setLabel(nextLabel);
      setCovering(true);
      pendingRef.current = href;
      window.setTimeout(() => {
        if (pendingRef.current) {
          router.push(pendingRef.current);
          pendingRef.current = null;
        }
      }, DURATION * 1000);
    },
    [pathname, reduced, router]
  );

  // Новая страница смонтирована — поднимаем шторку
  useEffect(() => {
    if (!covering) return;
    const id = window.setTimeout(() => setCovering(false), 260);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {covering ? (
          <motion.div
            key="curtain"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-paper"
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: DURATION, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.span
              className="plaque text-azure"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
            >
              {label || 'Переход в следующий зал'}
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TransitionCtx.Provider>
  );
}

export function TransitionLink({
  href,
  label,
  children,
  className = '',
  ...rest
}: {
  href: string;
  label?: string;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>) {
  const { navigate } = useTransition();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(href, label);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
