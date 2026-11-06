/**
 * MoodMatch recommendation engine (rule-based, no randomness).
 *
 * Workflow (the numbers match the project brief):
 *   1. The controller receives the selected mood from the frontend.
 *   2. It looks up the mood row (mood id).
 *   3. It loads the mood's genres from the mood_genres table.
 *   4. It fetches the books and movies of those genres from MySQL.
 *   5. THIS FILE ranks them:  score = 0.6 x rating + 0.4 x genre relevance
 *   6. The top items per type are returned to the frontend.
 *   7. Each item gets a plain-English reason.
 *
 * Both parts of the score are normalised to a 0..1 range:
 *   rating score    = rating / maximum rating   (books /5, movies /10)
 *   relevance score = priority / 3              (priority comes from mood_genres:
 *                                                3 = best genre for the mood)
 *
 * Example: a Happy mood, Comedy book (priority 3) rated 4.3/5
 *   score = 0.6 x (4.3 / 5) + 0.4 x (3 / 3) = 0.516 + 0.4 = 0.916
 */

export const WEIGHTS = { rating: 0.6, relevance: 0.4 };
export const MAX_RATING = { book: 5, movie: 10 };
export const MAX_PRIORITY = 3;
export const DEFAULT_LIMIT = 6;

const round = (value, places = 3) => Number(value.toFixed(places));

// Step 5a: score one item.
export function scoreItem(item, type, mapping) {
  const ratingScore = Number(item.rating) / MAX_RATING[type];
  const relevanceScore = mapping.priority / MAX_PRIORITY;
  return round(WEIGHTS.rating * ratingScore + WEIGHTS.relevance * relevanceScore);
}

// Step 7: build the explanation shown on each card.
export function buildReason(moodName, mapping, item, type) {
  return (
    `Picked for your ${moodName} mood: ${mapping.reason} ` +
    `It is a ${item.genre} ${type} rated ${Number(item.rating).toFixed(1)}/${MAX_RATING[type]}.`
  );
}

// Step 5b: score, sort and trim a list of items of one type.
export function rankItems({ items, type, moodName, mappings, limit = DEFAULT_LIMIT }) {
  const mappingByGenre = new Map(mappings.map((mapping) => [mapping.genre_id, mapping]));

  return items
    .filter((item) => mappingByGenre.has(item.genre_id)) // ignore genres not linked to the mood
    .map((item) => {
      const mapping = mappingByGenre.get(item.genre_id);
      return {
        ...item,
        score: scoreItem(item, type, mapping),
        reason: buildReason(moodName, mapping, item, type),
      };
    })
    .sort(
      // highest score first; ties -> higher rating -> alphabetical title (stable, no randomness)
      (a, b) => b.score - a.score || b.rating - a.rating || a.title.localeCompare(b.title)
    )
    .slice(0, limit);
}

// Ranks books and movies for one mood.
export function buildRecommendations({ mood, mappings, books, movies, limit = DEFAULT_LIMIT }) {
  return {
    books: rankItems({ items: books, type: 'book', moodName: mood.mood_name, mappings, limit }),
    movies: rankItems({ items: movies, type: 'movie', moodName: mood.mood_name, mappings, limit }),
  };
}
