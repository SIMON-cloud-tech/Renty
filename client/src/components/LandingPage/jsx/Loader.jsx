import '../css/Loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader-ring" role="status" aria-live="polite" aria-label="Loading">
        {/* 12 segments, each rotated by 30° and delayed slightly.
            Together they form the trailing-tail spinner Windows uses. */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="loader-ring-dot"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-22px)`,
              animationDelay: `${(i * 1.4) / 12}s`,
            }}
          />
        ))}
      </div>
      <p className="loader-text">Loading Renty…</p>
    </div>
  );
};

export default Loader;