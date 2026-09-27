import { FiUser, FiHome, FiBriefcase, FiSmartphone } from 'react-icons/fi';
import SEO from '../../SEO/Seo';
import '../css/Partners.css';

const DIRECT_PARTNERS = [
  {
    icon: FiUser,
    title: 'Clients',
    subtitle: 'People looking for a place to rent',
    benefits: [
      'Browse verified, vacant listings without middlemen or scams',
      'Book a house securely with M-Pesa — no cash handed to strangers',
      'Track every payment and booking from one dashboard',
      'Raise a complaint and get a direct response from your landlord',
    ],
  },
  {
    icon: FiHome,
    title: 'Landlords',
    subtitle: 'People who own rental units',
    benefits: [
      'List your units in front of renters actively searching, at no upfront cost',
      'Get paid directly to your M-Pesa once a booking is confirmed',
      'See your units, tenants, and payments in one dashboard',
      'Fewer vacancies — a listed unit is a unit renters can actually find',
    ],
  },
  {
    icon: FiBriefcase,
    title: 'Realtors & Agents',
    subtitle: 'People who manage properties for others',
    benefits: [
      'List and manage multiple properties on behalf of your landlords',
      'Earn from every successful booking you bring onto the platform',
      'One dashboard for every unit you manage, instead of scattered spreadsheets',
      'Build a track record and visibility that grows your own client base',
    ],
  },
];

const INDIRECT_PARTNERS = [
  {
    icon: FiSmartphone,
    title: 'Payment Partners',
    subtitle: 'The infrastructure behind every transaction',
    description:
      "Renty works with licensed M-Pesa payment partners to move money safely between clients and landlords. They don't appear on the platform directly, but every booking depends on them: they process the M-Pesa prompt, confirm payment instantly, and make sure funds reach the right landlord without cash ever changing hands physically.",
  },
];

const Partners = () => {
  return (
    <>
      <SEO
        title="Our Partners"
        description="See who Renty works with — clients, landlords, and realtors directly, and the payment infrastructure that powers every booking behind the scenes."
        keywords="Renty partners, landlords Kenya, realtors Kenya, rental platform partners, M-Pesa payments"
      />

      <div className="partners-page">
        {/* ── Intro ── */}
        <section className="partners-intro">
          <h5 className="partners-strip">Who we work with</h5>
          <h1 className="partners-title">Built on real partnerships</h1>
          <p className="partners-subtitle">
            Renty only works because every side of the rental process benefits from being here —
            renters, landlords, the agents who manage properties, and the payment infrastructure
            that makes it all move safely.
          </p>
        </section>

        {/* ── Direct partners ── */}
        <section className="partners-section">
          <div className="partners-section-header">
            <h2>Direct Partners</h2>
            <p>The people who use Renty every day, and what they get from it.</p>
          </div>

          <div className="partners-grid">
            {DIRECT_PARTNERS.map(({ icon: Icon, title, subtitle, benefits }) => (
              <div key={title} className="partner-card">
                <div className="partner-icon">
                  <Icon size={28} />
                </div>
                <h3>{title}</h3>
                <p className="partner-subtitle">{subtitle}</p>
                <ul className="partner-benefits">
                  {benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Indirect partners ── */}
        <section className="partners-section partners-section-alt">
          <div className="partners-section-header">
            <h2>Indirect Partners</h2>
            <p>They don't appear on the platform, but nothing works without them.</p>
          </div>

          <div className="partners-grid partners-grid-single">
            {INDIRECT_PARTNERS.map(({ icon: Icon, title, subtitle, description }) => (
              <div key={title} className="partner-card partner-card-wide">
                <div className="partner-icon">
                  <Icon size={28} />
                </div>
                <h3>{title}</h3>
                <p className="partner-subtitle">{subtitle}</p>
                <p className="partner-description">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Partners;