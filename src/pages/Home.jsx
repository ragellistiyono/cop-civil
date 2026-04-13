import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Workflow from '../components/Workflow';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Workflow />
      <Stats />
      <Footer />
    </>
  );
}
