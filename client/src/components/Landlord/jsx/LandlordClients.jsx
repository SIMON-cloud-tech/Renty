import { useState, useEffect } from 'react';
import '../../Business/css/Unit.css';

const HEADERS = ['Client', 'House', 'Duration of Stay', 'Amount (KES)'];

const LandlordClients = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/landlord/clients', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load clients:', err);
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
              <td>{r.client ?? ''}</td>
              <td>{r.house ?? ''}</td>
              <td>{`${r.months ?? 0} ${r.months === 1 ? 'month' : 'months'}`}</td>
              <td>{r.amount != null ? Number(r.amount).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandlordClients;