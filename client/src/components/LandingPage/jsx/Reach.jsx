import { useState, useCallback, memo } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import '../css/Contact.css';

// ── Config ──
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '254700000000';
const MAP_EMBED =
  import.meta.env.VITE_MAP_EMBED_URL ||
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816031465158!2d36.82632290000001!3d-1.2843004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11938e8142e5%3A0xb86e39e564106f6f!2sCookie%20House!5e0!3m2!1sen!2ske!4v1784716867725!5m2!1sen!2ske';

// ── Contact Details ──
const CONTACT_DETAILS = [
  {
    id: 'location',
    label: 'Location',
    value: 'Nairobi, Kenya',
    href: '#',
    icon: <FaMapMarkerAlt />,
  },
  {
    id: 'phone',
    label: 'Phone / WhatsApp',
    value: '+254 700 000 000',
    href: 'tel:+254700000000',
    icon: <FaPhone />,
  },
  {
    id: 'email',
    label: 'Email',
    value: 'simonmbithi143@gmail.com',
    href: 'mailto:simonmbithi143@gmail.com',
    icon: <FaEnvelope />,
  },
  {
    id: 'website',
    label: 'Website',
    value: 'renty.co.ke',
    href: 'https://renty.co.ke',
    icon: <FaGlobe />,
  },
];

const WORKING_HOURS = [
  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

// ── Row Component ──
const DetailRow = memo(({ icon, label, value, href }) => (
  <a href={href} className="detail-row" target="_blank" rel="noopener noreferrer">
    <span className="detail-row__icon">{icon}</span>
    <span>
      <strong>{label}</strong>
      <p>{value}</p>
    </span>
  </a>
));

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // ── Save lead to database ──
  const saveLead = useCallback(async (leadData) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      if (!res.ok) console.error('Failed to save lead');
    } catch (err) {
      console.error('Lead save error:', err);
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const text = `
Hi Renty Team 👋

I'm looking for a place to rent.

My details:
• Name: ${form.name}
• Phone: ${form.phone}
• Email: ${form.email || 'N/A'}

My enquiry:
${form.message}

Please advise on available units, rent, and viewing times.

Looking forward to your reply 🏠
`;

      // ── Save lead to database ──
      setSaving(true);
      saveLead({
        name: form.name,
        phone: form.phone,
        email: form.email || '',
        message: form.message,
        source: 'contact_form',
        status: 'new',
      });

      // ── Open WhatsApp ──
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');

      setSubmitted(true);
      setForm(EMPTY_FORM);
      setSaving(false);
      setTimeout(() => setSubmitted(false), 3000);
    },
    [form, saveLead]
  );

  return (
    <section className="contact-section">
      {/* HEADER */}
      <div className="contact-header">
        <h2 className="contact-title">Get in Touch</h2>
        <p className="contact-subtitle">
          Looking for a place to rent? Reach out to us and we will help you
          find a home that fits your location and budget.
        </p>
      </div>

      {/* BODY */}
      <div className="contact-body">
        {/* LEFT */}
        <div className="contact-left">
          <h3>Contact Info</h3>

          <div>
            {CONTACT_DETAILS.map((d) => (
              <DetailRow key={d.id} {...d} />
            ))}
          </div>

          <div className="hours-card">
            <h4>Working Hours</h4>
            {WORKING_HOURS.map((w) => (
              <p key={w.day}>
                {w.day}: {w.hours}
              </p>
            ))}
          </div>

          <div className="delivery-areas">
            <h4>Service Areas</h4>
            <p>Nairobi, Kiambu, Machakos, Kajiado, and surrounding areas.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="contact-right">
          <h3>Request a Viewing</h3>

          {submitted && (
            <p className="success">
              ✓ WhatsApp opened — we will get back to you shortly 🏠
            </p>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address (optional)"
              value={form.email}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Tell us what you are looking for (e.g., bedsitter in Umoja, 1 bedroom under 15k, location, budget)"
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Send on WhatsApp 🏠'}
            </button>
          </form>
        </div>
      </div>

      {/* MAP */}
      <div className="contact-map">
        <iframe src={MAP_EMBED} title="Renty Location" loading="lazy" />
      </div>
    </section>
  );
};

export default Contact;