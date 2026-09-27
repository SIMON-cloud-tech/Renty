import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import videoData from '../../../data/videos.json';
import '../css/Videos.css';

const Videos = () => {
  const navigate = useNavigate();

  // videos[0] is the HD slot, videos[1] and videos[2] are the stacked slots
  const [videos, setVideos] = useState(videoData.videos);

  // Swap the clicked stacked video with the HD slot
  const handleSwap = (index) => {
    if (index === 0) return; // clicking the HD video does nothing
    setVideos((prev) => {
      const next = [...prev];
      [next[0], next[index]] = [next[index], next[0]];
      return next;
    });
  };

  return (
    <section className="videos-section">
      {/* ── Section 1: Hero ── */}
      <div className="videos-hero">
        {/* Left — text */}
        <div className="videos-copy">
          <h5 className="videos-strip">{videoData.strip}</h5>
          <h1 className="videos-title">{videoData.title}</h1>
          <p className="videos-description">{videoData.description}</p>

          <button
            className="videos-cta"
            onClick={() => navigate(videoData.ctaPath)}
          >
            {videoData.cta} <FiArrowRight size={16} />
          </button>
        </div>

        {/* Right — video layout */}
        <div className="videos-media">
          {/* HD slot */}
          <div className="videos-hd">
            <video
              key={videos[0].id}
              src={videos[0].src}
              poster={videos[0].poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <span className="videos-label">{videos[0].title}</span>
          </div>

          {/* Stacked slots */}
          <div className="videos-stack">
            <div
              className="videos-tile"
              onClick={() => handleSwap(1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSwap(1)}
            >
              <video
                key={videos[1].id}
                src={videos[1].src}
                poster={videos[1].poster}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <span className="videos-label">{videos[1].title}</span>
            </div>

            <div
              className="videos-tile"
              onClick={() => handleSwap(2)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSwap(2)}
            >
              <video
                key={videos[2].id}
                src={videos[2].src}
                poster={videos[2].poster}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <span className="videos-label">{videos[2].title}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Videos;