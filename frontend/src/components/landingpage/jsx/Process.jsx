import { FiHome, FiTruck, FiShield } from 'react-icons/fi';
import '../css/Process.css';

const PROCESS_CONFIG = [
  {
    icon: <FiHome size={36} />,
    title: 'Browse & Select',
    description: 'Explore our wide range of furniture — from office seats and beds to wardrobes and TV stands. Find what fits your space and style.',
  },
  {
    icon: <FiTruck size={36} />,
    title: 'Order & Deliver',
    description: 'Place your order online or in-store. We deliver across Nairobi — free within the city, with affordable rates for other areas.',
  },
  {
    icon: <FiShield size={36} />,
    title: 'Enjoy & Relax',
    description: 'Your furniture is set up and ready to use. We stand behind everything with a 2‑year warranty — so you can relax and enjoy.',
  },
];

const Process = () => {
  return (
    <section className="process-section">
      <h2 className="process-title">How It Works</h2>
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