import { useState } from 'react';
import '../css/House.css';

const House = () => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setHouse(null);

    if (!location || !budget) {
      setError('Please enter both location and budget.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/house/search?location=${encodeURIComponent(location)}&budget=${encodeURIComponent(budget)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'No house found for that location and budget.');
      } else {
        setHouse(data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="house-page">
      <div className="house-header">
        <h5>Find your next home</h5>
        <h1>Search for a house by location and budget</h1>
        <p>
          Enter your preferred area and the amount you can afford.
          We will match you with a house that fits.
        </p>
      </div>

      <form className="house-search-grid" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Location e.g. Umoja"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Budget e.g. 15000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="house-error">{error}</p>}

      {house && (
        <div className="house-floating-card">
          <div className="house-card-image">
            {house.images?.length > 0 ? (
              <img src={house.images[0]} alt={house.houseType || 'House'} />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
          </div>

          <div className="house-card-body">
            <h3>{house.houseType || 'House'}</h3>
            <p className="house-card-location">📍 {house.location || 'Unknown'}</p>
            <p className="house-card-rent">
              KES {Number(house.rent || 0).toLocaleString()} / month
            </p>
            <div className="house-card-landlord">
              <strong>{house.landlord || 'Landlord'}</strong>
              {house.landlordPhone && <span> · {house.landlordPhone}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default House;