import { useState } from 'react';

// Shows the real cover/poster when an image URL exists. Otherwise (or if the
// image fails to load) it draws a styled placeholder whose colour comes from
// the title, so every item always looks different and consistent.
function hueFromTitle(title) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return 250 + (hash % 100); // purple -> pink range
}

export default function CoverArt({ src, title, type, className = '' }) {
  const [failed, setFailed] = useState(false);
  const hue = hueFromTitle(title);

  if (src && !failed) {
    return (
      <div className={`cover ${className}`}>
        <img src={src} alt={`${title} ${type === 'book' ? 'cover' : 'poster'}`} loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div
      className={`cover cover--placeholder ${className}`}
      style={{
        background: `linear-gradient(155deg, hsl(${hue} 60% 38%), hsl(${(hue + 40) % 360} 65% 24%))`,
      }}
      role="img"
      aria-label={`${title} ${type === 'book' ? 'cover' : 'poster'}`}
    >
      <span className="cover__icon" aria-hidden="true">{type === 'book' ? '📖' : '🎬'}</span>
      <span className="cover__title">{title}</span>
    </div>
  );
}
