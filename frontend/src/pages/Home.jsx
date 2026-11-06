import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import MoodCard from '../components/MoodCard';
import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { fetchBooks, fetchMovies } from '../services/contentService';
import { fetchMoods } from '../services/moodService';

const STEPS = [
  { icon: '🎭', title: 'Pick your mood', text: 'Choose how you feel right now from eight moods.' },
  { icon: '🧠', title: 'We find your match', text: 'Our rule-based algorithm links your mood to the genres that suit it.' },
  { icon: '🍿', title: 'Enjoy the story', text: 'Get ranked books and movies, each with a reason, and save your favourites.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaPath = isAuthenticated ? '/moods' : '/register';

  const moods = useFetch(fetchMoods, []);
  const featured = useFetch(
    async () => {
      const [books, movies] = await Promise.all([
        fetchBooks({ sort: 'rating', limit: 4 }),
        fetchMovies({ sort: 'rating', limit: 4 }),
      ]);
      return { books, movies };
    },
    []
  );

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="pill">📚 Books · 🎬 Movies · 💜 Moods</span>
          <h1>
            Your Mood. <span className="gradient-text">Your Story.</span> Your Match.
          </h1>
          <p className="hero__lead">
            Tell MoodMatch how you feel and it recommends books and movies that fit your emotional
            state, whether you want to laugh, unwind, get motivated or fall in love with a story.
          </p>
          <div className="hero__actions">
            <Link to={ctaPath} className="btn btn--primary btn--large">Discover Your Mood</Link>
            <a href="#how-it-works" className="btn btn--ghost btn--large">How it works</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Eight moods"
            title="How are you feeling today?"
            subtitle="Pick one after you log in and we will do the rest."
          />
          {moods.loading && <Loader label="Loading moods..." />}
          {moods.error && <Alert type="error" onRetry={moods.reload}>{moods.error}</Alert>}
          {moods.data && (
            <div className="mood-grid">
              {moods.data.map((mood) => (
                <MoodCard key={mood.mood_id} mood={mood} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt" id="how-it-works">
        <div className="container">
          <SectionHeading align="center" eyebrow="Simple" title="How it works" />
          <div className="steps">
            {STEPS.map((step, index) => (
              <div className="step" key={step.title}>
                <span className="step__number">{index + 1}</span>
                <span className="step__icon" aria-hidden="true">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Featured"
            title="Top rated picks"
            subtitle="Highly rated books and movies from our collection."
          />
          {featured.loading && <Loader label="Loading featured picks..." />}
          {featured.error && <Alert type="error" onRetry={featured.reload}>{featured.error}</Alert>}
          {featured.data && (
            <>
              <h3 className="subheading">📖 Featured books</h3>
              <div className="card-grid">
                {featured.data.books.map((book) => (
                  <ContentCard key={book.book_id} type="book" item={book} />
                ))}
              </div>
              <h3 className="subheading">🎬 Featured movies</h3>
              <div className="card-grid">
                {featured.data.movies.map((movie) => (
                  <ContentCard key={movie.movie_id} type="movie" item={movie} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <h2>Ready to find your match?</h2>
            <p>Create a free account and get recommendations in under a minute.</p>
            <Link to={ctaPath} className="btn btn--cream btn--large">Get started</Link>
          </div>
        </div>
      </section>
    </>
  );
}
