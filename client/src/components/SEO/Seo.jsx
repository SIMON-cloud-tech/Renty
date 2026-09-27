import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Renty';

const DEFAULT_TITLE = 'Houses for Rent in Kenya';
const DEFAULT_DESCRIPTION =
  'Renty is a rental property platform in Kenya. Browse bedsitters, single rooms, and 1, 2 and 3 bedroom houses for rent, book securely with M-Pesa, and manage your rentals in one place.';
const DEFAULT_KEYWORDS =
  'houses for rent Kenya, bedsitter for rent Nairobi, 1 bedroom for rent, 2 bedroom for rent, 3 bedroom for rent, rental properties Kenya, apartments for rent Nairobi, rent a house online Kenya, pay rent with M-Pesa, landlords Kenya, Renty';

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  canonicalUrl,
  structuredData,
  noIndex = false,
  additionalMeta = [],
}) => {
  // Pass only the page name as `title`; " | Renty" is added here (once)
  const fullTitle = !title
    ? `${SITE_NAME} | ${DEFAULT_TITLE}`
    : title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`;

  const siteDescription = description || DEFAULT_DESCRIPTION;
  const siteKeywords = keywords || DEFAULT_KEYWORDS;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = import.meta.env.VITE_SITE_URL || origin || 'https://www.renty.co.ke'; // <-- replace with your real domain
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const defaultImage = ogImage || `${baseUrl}/logo.png`;
  const canonical = canonicalUrl || `${baseUrl}${path}`;

  // Site-wide fallback, replaced by page-specific structuredData when a page passes one
  const schema = structuredData || {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    areaServed: 'KE',
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl || canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:image:alt" content="Renty rental houses in Kenya" />

      <meta name="theme-color" content="#8B5E3C" />
      <meta name="msapplication-TileColor" content="#8B5E3C" />

      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SEO;