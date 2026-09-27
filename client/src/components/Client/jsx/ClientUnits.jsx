import { useState, useEffect } from 'react';
import '../../Business/css/Unit.css';

const HEADERS = ['House', 'Amount (KES)', 'Location', 'Landlord'];

const ClientUnits = () => {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('/api/client/units', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setUnits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load units:', err);
        setUnits([]);
      }
    };
    fetchUnits();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {units.map(u => (
            <tr key={u._id}>
              <td>{u.house ?? ''}</td>
              <td>{u.amount != null ? Number(u.amount).toLocaleString() : ''}</td>
              <td>{u.location ?? ''}</td>
              <td>
                <div>{u.landlordName ?? ''}</div>
                <div className="units-subtext">{u.landlordPhone ?? ''}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientUnits;