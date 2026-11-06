# MoodMatch REST API

Base URL: `http://localhost:5000/api`

All responses are JSON.

```json
{ "success": true,  "message": "…", "data": { } }
{ "success": false, "message": "…", "errors": { "field": "problem" } }   // errors only for validation
```

Protected routes need the header `Authorization: Bearer <token>` (token from login).

Status codes: 200 OK · 201 Created · 400 validation / bad input · 401 not logged in or bad token · 404 not found · 409 duplicate · 500 server error.

---

## Authentication

### POST /auth/register
Body: `{ "fullName", "email", "password", "confirmPassword" }`
Rules: name 2–100 chars; valid email; password 8–72 chars with a letter and a number; passwords must match; email must be unique.
→ **201** `data: { user: { user_id, full_name, email, created_at } }`
→ **400** validation errors · **409** email already registered

### POST /auth/login
Body: `{ "email", "password" }`
→ **200** `data: { token, user }` · **401** invalid email or password

### GET /auth/profile  🔒
→ **200** `data: { user }` · **401** token missing/invalid/expired, or the account no longer exists

---

## Moods

### GET /moods
→ **200** `data: { moods: [{ mood_id, mood_name, emoji, description }] }` (8 moods)

### POST /moods/recommendations
Body: `{ "moodId": 4 }` (or `{ "mood": "Motivated" }`)
→ **200**
```json
{ "data": {
    "mood":   { "mood_id": 4, "mood_name": "Motivated", "emoji": "🔥", "description": "…" },
    "genres": [{ "genre_id": 1, "genre_name": "Self-Help", "priority": 3, "reason": "…" }],
    "books":  [{ "book_id": 1, "title": "…", "author": "…", "genre": "Self-Help", "rating": 4.4,
                 "published_year": 2018, "cover_image": null, "description": "…",
                 "score": 0.88, "reason": "Picked for your Motivated mood: …" }],
    "movies": [{ "movie_id": 1, "title": "…", "director": "…", "release_year": 2006,
                 "poster_image": null, "score": 0.83, "reason": "…" }] } }
```
Books and movies are sorted by `score` (highest first); up to 6 of each.
→ **400** missing/invalid mood · **404** mood not found

---

## Books and movies (public)

### GET /books · GET /movies
Optional query: `genre=Comedy`, `search=harry`, `sort=rating` (default), `limit` (max 100, default 50)
→ **200** `data: { books: [...] }` / `data: { movies: [...] }`

### GET /books/:id · GET /movies/:id
→ **200** `data: { book: {...} }` / `data: { movie: {...} }`
→ **400** invalid id · **404** not found

---

## Favourites 🔒

### GET /favourites
→ **200** `data: { books: [...], movies: [...] }` – only the logged-in user's items; each has `favourite_id`.

### POST /favourites
Body: exactly one of `{ "bookId": 3 }` or `{ "movieId": 7 }`
→ **201** `data: { favourite_id }`
→ **400** neither or both supplied · **404** book/movie not found · **409** already a favourite

### DELETE /favourites/:id
`:id` is the `favourite_id`. A user can only delete their own.
→ **200** · **404** not found (or belongs to another user)

---

## Mood history 🔒

### GET /history
→ **200** `data: { history: [{ history_id, mood_id, mood_name, emoji, selected_at }] }` (newest first, current user only)

### POST /history
Body: `{ "moodId": 4 }`
→ **201** `data: { history_id, mood }` · **400** invalid · **404** mood not found

---

## Contact

### POST /contact
Body: `{ "name", "email", "subject", "message" }`
Rules: name 2–100, valid email, subject 3–150, message 10–2000 chars.
→ **201** `message: "Thank you! Your message has been sent."` · **400** validation errors

---

### GET /health
→ **200** `{ "success": true, "message": "MoodMatch API is running" }`
