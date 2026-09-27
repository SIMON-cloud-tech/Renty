import SEO from '../components/SEO/Seo.jsx';
import Story from '../components/LandingPage/jsx/Story.jsx';

function About() {
  return (
    <>
      <SEO
        title="About Renty"
        description="Learn about Renty, the platform connecting renters and landlords across Nairobi with secure M-Pesa bookings and verified listings."
        keywords="about Renty, rental platform Kenya, house hunting Nairobi, landlord platform Kenya"
      />
      <Story />
    </>
  );
}

export default About;