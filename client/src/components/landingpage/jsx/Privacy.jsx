import { useState, useEffect } from 'react';
import { FiShield, FiLock, FiMail, FiPhone, FiMapPin, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import privacyData from '../../../data/privacy.json';
import SEO from '../../SEO/Seo';
import '../css/Privacy.css';

const Privacy = () => {
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from JSON (already imported)
    setLoading(false);
  }, []);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderContent = (content) => {
    return content.map((item, idx) => {
      if (item.type === 'text') {
        return <p key={idx} className="privacy-text">{item.text}</p>;
      }
      if (item.type === 'list') {
        return (
          <ul key={idx} className="privacy-list">
            {item.items.map((listItem, listIdx) => (
              <li key={listIdx} className="privacy-list-item">
                {listItem}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="privacy-loading">
        <div className="spinner"></div>
        <p>Loading privacy policy...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Privacy Policy | FurniHaven"
        description="Learn how FurniHaven collects, uses, and protects your personal information."
        keywords="privacy policy, data protection, Kenya DPA, furniture store privacy"
      />
      <div className="privacy-page">
        <div className="privacy-container">
          {/* Header */}
          <div className="privacy-header">
            <div className="privacy-header-icon">
              <FiShield size={32} />
            </div>
            <h1>{privacyData.title}</h1>
            <p className="privacy-updated">
              Last Updated: {privacyData.lastUpdated}
            </p>
          </div>

          {/* Intro */}
          <div className="privacy-intro">
            <p>{privacyData.intro}</p>
          </div>

          {/* Sections */}
          <div className="privacy-sections">
            {privacyData.sections.map((section) => {
              const isOpen = openSections[section.id];
              return (
                <div key={section.id} className="privacy-section">
                  <button
                    className={`privacy-section-header ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="privacy-section-heading">{section.heading}</span>
                    <span className="privacy-section-icon">
                      {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="privacy-section-content">
                      {renderContent(section.content)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Contact */}
          <div className="privacy-contact">
            <h3>Questions About This Policy?</h3>
            <div className="privacy-contact-items">
              <a href="mailto:info@furnihaven.co.ke" className="privacy-contact-item">
                <FiMail size={18} />
                info@furnihaven.co.ke
              </a>
              <a href="tel:+254727713219" className="privacy-contact-item">
                <FiPhone size={18} />
                +254 727 713 219
              </a>
              <span className="privacy-contact-item">
                <FiMapPin size={18} />
                Nairobi, Kenya
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;