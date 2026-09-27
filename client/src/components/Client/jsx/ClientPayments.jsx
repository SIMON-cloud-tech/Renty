import { useState, useEffect } from 'react';
import '../../Business/css/Unit.css';

const HEADERS = ['Landlord', 'Amount (KES)', 'Status', 'House', 'Location', 'Action'];

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/client/payments', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load payments:', err);
        setPayments([]);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p._id}>
              <td>{p.landlord ?? ''}</td>
              <td>{p.amount != null ? Number(p.amount).toLocaleString() : ''}</td>
              <td>
                <span className={`status-badge ${p.status ?? ''}`}>
                  {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : ''}
                </span>
              </td>
              <td>{p.house ?? ''}</td>
              <td>{p.location ?? ''}</td>
              <td>
                {/* Approve button is display-only for now; no handler yet */}
                {p.status === 'pending' && (
                  <button type="button" className="approve-btn">Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientPayments;