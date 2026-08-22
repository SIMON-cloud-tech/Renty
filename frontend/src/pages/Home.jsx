
import SEO from '../components/SEO/Seo.jsx';
import Hero from '../components/landingpage/jsx/Hero.jsx';
import Process from '../components/landingpage/jsx/Process.jsx';
import Story from '../components/landingpage/jsx/Story.jsx';
import FeaturedProducts from '../components/landingpage/jsx/FeaturedProducts.jsx';
import Reach from '../components/landingpage/jsx/Reach.jsx';
import ProjectsSection from '../components/landingpage/jsx/ProjectsSection.jsx';
import LatestBlogs from '../components/landingpage/jsx/LatestBlogs.jsx';
import Testimonials from '../components/landingpage/jsx/Testimonials.jsx';


function Home(){
  return(
    <>
      <SEO
        title="Modern Furniture & Home Essentials in Kenya"
        description="FurniHaven offers stylish furniture, home decor, storage solutions, and functional everyday pieces for homes and offices across Kenya."
        keywords="furniture Kenya, home decor, sofas, dining sets, bedroom furniture, office furniture, FurniHaven"
      />
      <Hero />
      <Story />
      <Process />
      <Products variant="light" />
      <Reach />
      <Testimonials />
      <LatestBlogs />
    </>
  )
}
export default Home;