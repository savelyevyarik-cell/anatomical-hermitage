import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Unbounded, Inter, IBM_Plex_Mono, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

import SmoothScroll from '@/components/providers/SmoothScroll';
import { TransitionProvider } from '@/components/layout/Transition';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Cursor from '@/components/layout/Cursor';
import Preloader from '@/components/layout/Preloader';
import { MUSEUM } from '@/lib/content';

/* Пять гарнитур, у каждой своя роль. Кириллица подключена везде. */
const display = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const grotesk = Unbounded({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500'],
  variable: '--font-grotesk',
  display: 'swap',
  preload: true,
});

/* Inter — самый нейтральный и разборчивый гротеск с полной кириллицей */
const body = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

/* IBM Plex Mono — спокойнее JetBrains на кириллице, ближе к музейной этикетке */
const mono = IBM_Plex_Mono({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

const quote = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-quote',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anatomical-hermitage.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Анатомический эрмитаж — музей анатомии ПСПбГМУ им. И. П. Павлова',
    template: '%s — Анатомический эрмитаж',
  },
  description:
    'Один из старейших анатомических музеев Санкт-Петербурга при действующей кафедре нормальной анатомии: влажные препараты, костные экспозиции, муляжи и рентгенологический зал. Посещение по предварительной записи.',
  keywords: [
    'анатомический музей Санкт-Петербург',
    'музей анатомии ПСПбГМУ',
    'рентгенологический зал',
    'экскурсии Петроградский район',
  ],
  authors: [{ name: 'Анатомический эрмитаж' }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'Анатомический эрмитаж',
    title: 'Анатомический эрмитаж — музей анатомии ПСПбГМУ им. И. П. Павлова',
    description:
      'Влажные препараты, скелеты, муляжи и зал с подсвеченными рентгеновскими снимками. Музей закрытого типа: только по предварительной записи, только в рабочие дни.',
    images: [{ url: '/images/anatomy-4.jpg', width: 1200, height: 630, alt: 'Рентгенологический зал музея' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Анатомический эрмитаж',
    description: 'Музей анатомии ПСПбГМУ им. И. П. Павлова. Посещение по предварительной записи.',
    images: ['/images/anatomy-4.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#FCFBF7',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Museum',
  name: 'Анатомический эрмитаж',
  alternateName: MUSEUM.legal,
  url: siteUrl,
  description:
    'Музей анатомии при Первом Санкт-Петербургском государственном медицинском университете им. И. П. Павлова.',
  image: `${siteUrl}/images/anatomy-4.jpg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Санкт-Петербург',
    addressRegion: 'Петроградский район',
    addressCountry: 'RU',
  },
  telephone: MUSEUM.phone,
  email: MUSEUM.email,
  openingHours: 'Mo-Fr 10:00-17:00',
  isAccessibleForFree: false,
  publicAccess: true,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '263',
    ratingCount: '718',
    bestRating: '5',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${grotesk.variable} ${body.variable} ${mono.variable} ${quote.variable}`}
    >
      <body className="bg-paper text-navy antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <Cursor />
        <TransitionProvider>
          <SmoothScroll>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
        </TransitionProvider>
      </body>
    </html>
  );
}
