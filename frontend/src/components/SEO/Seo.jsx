import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  canonicalUrl,
  structuredData,
  noIndex = false,
  additionalMeta = []
}) => {
  const siteTitle = 'FurniHaven';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription =
    description ||
    'FurniHaven offers stylish, affordable furniture and home essentials for living rooms, bedrooms, dining spaces, and offices in Kenya. Discover quality sofas, tables, beds, storage solutions, and modern decor designed for everyday comfort.';
  const siteKeywords =
    keywords ||
    'furniture Kenya, home furniture, sofa Kenya, dining table Kenya, bedroom furniture, office furniture, modern furniture, affordable furniture, FurniHaven furniture, interior design Kenya';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = import.meta.env.VITE_SITE_URL || origin || 'https://www.furnihaven.co.ke';
  const defaultImage = ogImage || `${baseUrl}/logo.png`;
  const canonical = canonicalUrl || `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="FurniHaven" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl || canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:image:alt" content="FurniHaven furniture and home decor" />

      <meta name="theme-color" content="#8B5E3C" />
      <meta name="msapplication-TileColor" content="#8B5E3C" />

      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;