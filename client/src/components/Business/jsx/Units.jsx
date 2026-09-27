import { useState, useEffect } from 'react';
import '../css/Unit.css';

const HEADERS = ['House', 'Rent (KES / month)', 'Location', 'Landlord'];

const Units = () => {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('/api/business/units', { credentials: 'include' });
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
              <td>{u.houseType ?? ''}</td>
              <td>{u.rent != null ? Number(u.rent).toLocaleString() : ''}</td>
              <td>{u.location ?? ''}</td>
              <td>{u.landlord ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Units;