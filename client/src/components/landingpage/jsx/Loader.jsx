import '../css/Loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <p className="loader-text">Loading FurniHaven...</p>
    </div>
  );
};

export default Loader;