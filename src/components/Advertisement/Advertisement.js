import React, { useState, useEffect } from 'react';
import './Advertisement.css';

const Advertisement = ({ ads, position }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredAds = (ads && Array.isArray(ads)) 
    ? ads.filter(ad => 
        ad.position && ad.position.toLowerCase() === position.toLowerCase() && ad.status == 1
      )
    : [];

  const totalAds = filteredAds.length;

  // Auto-play logic for slider
  useEffect(() => {
    if (totalAds <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalAds);
    }, 5000); // Change ad every 5 seconds

    return () => clearInterval(interval);
  }, [totalAds]); // Removed currentIndex to prevent interval reset on every change

  if (totalAds === 0) return null;

  return (
    <div className={`advertisement-section ad-${position}`}>
      <div className="container">
        <div className="ad-slider-container">
          {filteredAds.map((ad, index) => (
            <div 
              key={ad.id} 
              className={`ad-slide ${index === currentIndex ? 'active' : ''}`}
              style={{ 
                opacity: index === currentIndex ? 1 : 0,
                visibility: index === currentIndex ? 'visible' : 'hidden',
                position: index === currentIndex ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transition: 'opacity 0.8s ease-in-out'
              }}
            >
              <a 
                href={ad.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ad-wrapper-link"
              >
                <div className="ad-aspect-ratio-box">
                  <img src={ad.img} alt={ad.name || 'Advertisement'} className="ad-img-horizontal" />
                </div>
              </a>
            </div>
          ))}
          
          {totalAds > 1 && (
            <div className="ad-indicators">
              {filteredAds.map((_, index) => (
                <div 
                  key={index} 
                  className={`ad-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
