import { useState, useEffect } from 'react';
import '../css/Unit.css';

const HEADERS = ['Landlord', 'Phone', 'Location', 'Units'];

const Landlords = () => {
  const [landlords, setLandlords] = useState([]);

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        const res = await fetch('/api/business/landlords', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setLandlords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load landlords:', err);
        setLandlords([]);
      }
    };
    fetchLandlords();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {landlords.map(l => (
            <tr key={l._id}>
              <td>{l.landlord ?? ''}</td>
              <td>{l.phone ?? ''}</td>
              <td>{l.location ?? ''}</td>
              <td>{`${l.total ?? 0} (${l.occupied ?? 0} occupied)`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Landlords;