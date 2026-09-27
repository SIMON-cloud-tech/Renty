import SEO from '../components/SEO/Seo.jsx';
import Hero from '../components/LandingPage/jsx/Hero.jsx';
import House from '../components/LandingPage/jsx/House.jsx';
import Process from '../components/LandingPage/jsx/Process.jsx';
import Videos from '../components/LandingPage/jsx/Videos.jsx';
import Houses from '../components/LandingPage/jsx/Houses.jsx';
import Testimonials from '../components/LandingPage/jsx/Testimonials.jsx';
import Reach from '../components/LandingPage/jsx/Reach.jsx';
import Guides from '../components/LandingPage/jsx/Guides.jsx';
import BlogSection from '../components/LandingPage/jsx/BlogSection.jsx';

function Home() {
  return (
    <>
      <SEO
        title="Modern Furniture & Home Essentials in Kenya"
        description="FurniHaven offers stylish furniture, home decor, storage solutions, and functional everyday pieces for homes and offices across Kenya."
        keywords="furniture Kenya, home decor, sofas, dining sets, bedroom furniture, office furniture, FurniHaven"
      />
      <Hero />
      <House />
      <Process />
      <Videos />
      <Houses variant="light" />
      <Testimonials />
      <Reach />
      <Guides />
      <BlogSection variant="light" />
    </>
  );
}

export default Home;