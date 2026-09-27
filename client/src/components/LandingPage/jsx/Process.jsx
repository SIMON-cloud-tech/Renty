import { useEffect, useRef } from 'react';
import { FiSearch, FiTruck, FiHome } from 'react-icons/fi';
import '../css/Process.css';

const PROCESS_CONFIG = [
  {
    icon: <FiSearch size={36} />,
    title: 'Find Your House',
    description: 'Search by location and budget. Browse vacant units that fit what you can afford.',
  },
  {
    icon: <FiTruck size={36} />,
    title: 'Reserve & Pay',
    description: 'Reserve the unit, pay your deposit through M-Pesa, and receive confirmation instantly.',
  },
  {
    icon: <FiHome size={36} />,
    title: 'Move In',
    description: 'Collect your keys, meet your landlord, and settle into your new home.',
  },
];

const Process = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.process-step');
    if (!cards || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('process-step--visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="process-section" ref={sectionRef}>
      <div className="process-header">
        <h5 className="process-strip">Simple. Clear. Yours.</h5>
        <h1 className="process-title">A Comprehensive Process</h1>
        <p className="process-subtitle">
          From finding your next home to settling into it — three steps, no confusion.
        </p>
      </div>

      <div className="process-grid">
        {PROCESS_CONFIG.map((step, index) => (
          <div key={index} className="process-step">
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Process;