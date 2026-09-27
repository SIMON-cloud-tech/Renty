import { useState, useEffect } from 'react';
import '../../Business/css/Unit.css';

const HEADERS = ['House', 'Amount (KES)', 'Client'];

const LandlordCancellations = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/landlord/cancellations', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load cancellations:', err);
        setRows([]);
      }
    };
    fetchRows();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td>{r.house ?? ''}</td>
              <td>{r.amount != null ? Number(r.amount).toLocaleString() : ''}</td>
              <td>{r.client ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandlordCancellations;