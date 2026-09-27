import { useState, useEffect } from 'react';
import '../css/Unit.css';

const HEADERS = ['Landlord', 'House', 'Amount (KES)', 'Client', 'Location'];

const Cancellations = () => {
  const [cancellations, setCancellations] = useState([]);

  useEffect(() => {
    const fetchCancellations = async () => {
      try {
        const res = await fetch('/api/business/cancellations', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setCancellations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load cancellations:', err);
        setCancellations([]);
      }
    };
    fetchCancellations();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {cancellations.map(c => (
            <tr key={c._id}>
              <td>{c.landlord ?? ''}</td>
              <td>{c.house ?? ''}</td>
              <td>{c.amount != null ? Number(c.amount).toLocaleString() : ''}</td>
              <td>{c.client ?? ''}</td>
              <td>{c.location ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cancellations;