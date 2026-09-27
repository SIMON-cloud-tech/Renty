import { useState, useEffect } from 'react';
import '../css/Unit.css';

const HEADERS = ['Client', 'Landlord', 'Location'];

const Clients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/business/clients', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load clients:', err);
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c._id}>
              <td>{c.client ?? ''}</td>
              <td>{c.landlord ?? ''}</td>
              <td>{c.location ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;