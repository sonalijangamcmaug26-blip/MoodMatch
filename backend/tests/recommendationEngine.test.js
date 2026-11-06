import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRecommendations, scoreItem } from '../utils/recommendationEngine.js';

const mood = { mood_id: 1, mood_name: 'Happy' };
const mappings = [
  { genre_id: 1, priority: 3, reason: 'Comedy lifts your spirits.' },
  { genre_id: 2, priority: 1, reason: 'Adventure keeps the fun going.' },
];

test('score = 0.6 x rating + 0.4 x relevance (book rated 4.3/5, priority 3)', () => {
  assert.equal(scoreItem({ rating: 4.3 }, 'book', mappings[0]), 0.916);
});

test('movie ratings are normalised out of 10', () => {
  assert.equal(scoreItem({ rating: 8 }, 'movie', mappings[0]), 0.88);
});

test('items from genres not mapped to the mood are ignored', () => {
  const books = [{ book_id: 1, title: 'A', genre_id: 99, genre: 'Horror', rating: 5 }];
  const result = buildRecommendations({ mood, mappings, books, movies: [] });
  assert.equal(result.books.length, 0);
});

test('results are sorted by score, include a reason, and respect the limit', () => {
  const books = [
    { book_id: 1, title: 'Low', genre_id: 2, genre: 'Adventure', rating: 3 },
    { book_id: 2, title: 'High', genre_id: 1, genre: 'Comedy', rating: 4.5 },
    { book_id: 3, title: 'Mid', genre_id: 1, genre: 'Comedy', rating: 4 },
  ];
  const { books: ranked } = buildRecommendations({ mood, mappings, books, movies: [], limit: 2 });
  assert.deepEqual(ranked.map((b) => b.title), ['High', 'Mid']);
  assert.match(ranked[0].reason, /Happy mood/);
});

test('ranking is deterministic (same input, same output)', () => {
  const books = [
    { book_id: 1, title: 'B', genre_id: 1, genre: 'Comedy', rating: 4 },
    { book_id: 2, title: 'A', genre_id: 1, genre: 'Comedy', rating: 4 },
  ];
  const first = buildRecommendations({ mood, mappings, books, movies: [] });
  const second = buildRecommendations({ mood, mappings, books, movies: [] });
  assert.deepEqual(first, second);
  assert.equal(first.books[0].title, 'A'); // tie -> alphabetical
});
