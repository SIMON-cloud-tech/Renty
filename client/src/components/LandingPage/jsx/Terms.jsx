import SEO from '../../SEO/Seo';
import termsData from '../../../data/terms.json';
import '../css/Terms.css';

const Terms = () => {
  const { title, lastUpdated, intro, sections } = termsData;

  return (
    <>
      <SEO
        title={title}
        description="Read Renty's Terms and Conditions — how bookings, payments, commissions, and disputes are handled between renters, landlords, and Renty."
        keywords="Renty terms and conditions, rental platform terms, Renty policy"
      />

      <div className="policy-page">
        <header className="policy-header">
          <h1>{title}</h1>
          <p className="policy-updated">Last updated: {lastUpdated}</p>
          <p className="policy-intro">{intro}</p>
        </header>

        <div className="policy-body">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="policy-section">
              <h2>{section.heading}</h2>
              {section.content.map((block, i) => {
                if (block.type === 'text') {
                  return <p key={i}>{block.text}</p>;
                }
                if (block.type === 'list') {
                  return (
                    <ul key={i} className="policy-list">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return null;
              })}
            </section>
          ))}
        </div>
      </div>
    </>
  );
};

export default Terms;