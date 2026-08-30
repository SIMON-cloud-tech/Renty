import '../css/Loader.css';   // or wherever you put the styles

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="spinner"></div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default Loader;