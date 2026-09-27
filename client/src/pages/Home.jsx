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
import Affordability from '../components/LandingPage/jsx/Affordability.jsx';

function Home() {
  return (
    <>
      <SEO
        title="Find a Home to Rent in Kenya"
        description="Renty connects you to verified houses, bedsitters, and apartments for rent across Nairobi. Book securely with M-Pesa and manage everything from one dashboard."
        keywords="houses for rent Kenya, apartments Nairobi, bedsitter Nairobi, rental platform, book a house M-Pesa"
      />
      <Hero />
      <House />
      <Process />
      <Videos />
      <Affordability />
      <Houses variant="light" />
      <Testimonials />
      <Reach />
      <Guides variant="light" />
      <BlogSection variant="light" />
    </>
  );
}

export default Home;