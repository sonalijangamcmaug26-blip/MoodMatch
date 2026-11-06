import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import MoodCard from '../components/MoodCard';
import SectionHeading from '../components/SectionHeading';
import useFetch from '../hooks/useFetch';
import { getErrorMessage } from '../services/api';
import { saveMoodSelection } from '../services/historyService';
import { fetchMoods } from '../services/moodService';

export default function MoodSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: moods, loading, error, reload } = useFetch(fetchMoods, []);
  const [selectedId, setSelectedId] = useState(location.state?.moodId || null);
  const [contentType, setContentType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFindMatch = async () => {
    if (!selectedId || !contentType) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await saveMoodSelection(selectedId);
      navigate(`/recommendations/${selectedId}?type=${contentType}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Step 1"
          title="How are you feeling right now?"
          subtitle="Choose a mood, then choose whether you would like a book or a movie."
        />
        {loading && <Loader label="Loading moods..." />}
        {error && <Alert type="error" onRetry={reload}>{error}</Alert>}
        {moods && (
          <>
            <div className="mood-grid">
              {moods.map((mood) => (
                <MoodCard
                  key={mood.mood_id}
                  mood={mood}
                  selected={selectedId === mood.mood_id}
                  onSelect={(id) => { setSelectedId(id); setContentType(''); }}
                />
              ))}
            </div>

            {selectedId && (
              <div className="content-type-section">
                <h2 className="subheading">What would you like to discover?</h2>
                <div className="content-type-options">
                  <button type="button" className={`content-type-option ${contentType === 'book' ? 'content-type-option--selected' : ''}`} onClick={() => setContentType('book')} aria-pressed={contentType === 'book'}>
                    <span className="content-type-option__icon" aria-hidden="true">📚</span>
                    <span className="content-type-option__title">Books</span>
                    <span className="muted">Find a story to read</span>
                  </button>
                  <button type="button" className={`content-type-option ${contentType === 'movie' ? 'content-type-option--selected' : ''}`} onClick={() => setContentType('movie')} aria-pressed={contentType === 'movie'}>
                    <span className="content-type-option__icon" aria-hidden="true">🎬</span>
                    <span className="content-type-option__title">Movies</span>
                    <span className="muted">Find something to watch</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mood-actions">
              <Alert type="error">{submitError}</Alert>
              <button type="button" className="btn btn--primary btn--large" onClick={handleFindMatch} disabled={!selectedId || !contentType || submitting}>
                {submitting ? 'Finding your match...' : 'Find My Match'}
              </button>
              {!selectedId && <p className="muted">Select a mood to continue.</p>}
              {selectedId && !contentType && <p className="muted">Choose Books or Movies to continue.</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
