import SectionHeading from '../components/SectionHeading';

const ALGORITHM_STEPS = [
  'You choose one of the eight moods.',
  'The server finds that mood in the database.',
  'It reads the mood_genres table to get the three genres linked to the mood.',
  'It fetches every book and movie in those genres from MySQL.',
  'Each item gets a score: 60% from its rating and 40% from how strongly its genre fits your mood.',
  'The highest scoring items are returned, each with a short reason.',
];

const OBJECTIVES = [
  'Build a complete full-stack application with React, Node.js, Express and MySQL.',
  'Show a clear, explainable rule-based recommendation algorithm.',
  'Practise secure authentication with hashed passwords and JWT.',
  'Design a normalised relational database with proper constraints.',
  'Create a responsive, modern user interface.',
];

export default function About() {
  return (
    <section className="section">
      <div className="container container--narrow prose">
        <SectionHeading eyebrow="About us" title="What is MoodMatch?" />
        <p>
          MoodMatch is a web platform that recommends books and movies based on how you feel at
          this moment. Instead of scrolling through endless lists, you pick a mood and get a short,
          carefully ranked selection with a reason for every suggestion.
        </p>

        <h2>Why mood-based recommendations?</h2>
        <p>
          What we want to read or watch changes with our emotions. After a stressful day a calm,
          comforting story helps more than a tense thriller, while a motivated mood is perfect for
          an inspiring biography. Matching content to mood saves time and makes entertainment more
          satisfying.
        </p>

        <h2>How the algorithm works</h2>
        <ol>
          {ALGORITHM_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          There is no randomness: the same mood always gives the same ranked results, and the data
          lives in the database, so new books, movies and mood-genre links can be added without
          changing any code.
        </p>

        <h2>Project objectives</h2>
        <ul>
          {OBJECTIVES.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
