// Selectable mood tile. When `onSelect` is missing it renders as a static preview.
export default function MoodCard({ mood, selected = false, onSelect }) {
  const content = (
    <>
      <span className="mood-card__emoji" aria-hidden="true">{mood.emoji}</span>
      <span className="mood-card__name">{mood.mood_name}</span>
      <span className="mood-card__description">{mood.description}</span>
      {selected && <span className="mood-card__check" aria-hidden="true">✓</span>}
    </>
  );

  if (!onSelect) return <div className="mood-card mood-card--static">{content}</div>;

  return (
    <button
      type="button"
      className={`mood-card ${selected ? 'mood-card--selected' : ''}`}
      onClick={() => onSelect(mood.mood_id)}
      aria-pressed={selected}
    >
      {content}
    </button>
  );
}
