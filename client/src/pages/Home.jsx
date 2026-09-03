import SEO from '../components/SEO/Seo.jsx';
import Hero from '../components/landingpage/jsx/Hero.jsx';
import Categories from '../components/landingpage/jsx/Categories.jsx';
import Products from '../components/landingpage/jsx/Products.jsx';
import NewArrivals from '../components/landingpage/jsx/NewArrivals.jsx';
import Process from '../components/landingpage/jsx/Process.jsx';
import Story from '../components/landingpage/jsx/Story.jsx';
import Guides from '../components/landingpage/jsx/Guides.jsx';
import Testimonial from '../components/landingpage/jsx/Testimonials.jsx';
import BlogSection from '../components/landingpage/jsx/BlogSection.jsx';
import Reach from '../components/landingpage/jsx/Reach.jsx';

function Home() {
  return (
    <>
      <SEO
        title="Modern Furniture & Home Essentials in Kenya"
        description="FurniHaven offers stylish furniture, home decor, storage solutions, and functional everyday pieces for homes and offices across Kenya."
        keywords="furniture Kenya, home decor, sofas, dining sets, bedroom furniture, office furniture, FurniHaven"
      />
      <Hero />
      <Categories /> 
      <Products variant="light" /> 
      <NewArrivals />
      <Process />     
      <Story />
      <Guides variant="light" /> 
      <Testimonial /> 
      <BlogSection /> 
      <Reach />
    </>
  );
}

export default Home;