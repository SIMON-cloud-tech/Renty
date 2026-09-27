import { useState, useEffect, useCallback } from 'react';
import '../../Business/css/Unit.css';

const HEADERS = ['Client', 'Complaint', 'Action'];

const LandlordComplains = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch('/api/landlord/complaints', { credentials: 'include' });
        const data = res.ok ? await res.json() : null;
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load complaints:', err);
        setComplaints([]);
      }
    };
    fetchComplaints();
  }, []);

  const handleAddress = useCallback(async (id) => {
    // Open the tab immediately so popup blockers allow it, then point it at WhatsApp
    const win = window.open('', '_blank');
    try {
      const res = await fetch(`/api/landlord/complaints/${id}/address`, { method: 'POST', credentials: 'include' });
      const data = res.ok ? await res.json() : null;
      if (!data?.url) throw new Error('No WhatsApp link returned');
      if (win) win.location.href = data.url;
      else window.open(data.url, '_blank');
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status: 'addressed' } : c)));
    } catch (err) {
      console.error('Address error:', err);
      if (win) win.close();
    }
  }, []);

  return (
    <div className="units-table-wrapper">
      <table className="units-table">
        <thead>
          <tr>{HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {complaints.map(c => (
            <tr key={c.id}>
              <td>{c.client ?? ''}</td>
              <td>{c.complaint ?? ''}</td>
              <td>
                {c.status === 'addressed' ? (
                  <span className="units-subtext">Addressed</span>
                ) : (
                  <button type="button" className="approve-btn" onClick={() => handleAddress(c.id)}>Address</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandlordComplains;