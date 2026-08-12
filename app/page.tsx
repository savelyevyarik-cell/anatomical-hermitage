import Hero from '@/components/home/Hero';
import Manifesto from '@/components/home/Manifesto';
import Halls from '@/components/home/Halls';
import XrayRoom from '@/components/home/XrayRoom';
import Reviews from '@/components/home/Reviews';
import Cta from '@/components/home/Cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Halls />
      <XrayRoom />
      <Reviews />
      <Cta />
    </>
  );
}
