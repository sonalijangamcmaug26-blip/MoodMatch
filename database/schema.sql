-- ============================================================
-- MoodMatch - database schema (MySQL 8.0.16+)
-- Run this file first, then seed.sql.
-- WARNING: it drops and recreates the `moodmatch` database.
-- ============================================================

DROP DATABASE IF EXISTS moodmatch;
CREATE DATABASE moodmatch
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE moodmatch;

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  role       ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  password   VARCHAR(255) NOT NULL,            -- bcrypt hash, never plain text
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. moods
-- ------------------------------------------------------------
CREATE TABLE moods (
  mood_id     TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  mood_name   VARCHAR(30)  NOT NULL,
  emoji       VARCHAR(16)  NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (mood_id),
  UNIQUE KEY uq_moods_name (mood_name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. genres
-- ------------------------------------------------------------
CREATE TABLE genres (
  genre_id   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  genre_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (genre_id),
  UNIQUE KEY uq_genres_name (genre_name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. books  (one genre per book, linked by foreign key)
-- ------------------------------------------------------------
CREATE TABLE books (
  book_id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title          VARCHAR(200) NOT NULL,
  author         VARCHAR(150) NOT NULL,
  description    TEXT         NOT NULL,
  genre_id       SMALLINT UNSIGNED NOT NULL,
  rating         DECIMAL(3,1) NOT NULL DEFAULT 0.0,   -- scale 0.0 - 5.0
  cover_image    VARCHAR(500) NULL,
  published_year SMALLINT     NOT NULL,
  PRIMARY KEY (book_id),
  KEY idx_books_genre (genre_id),
  KEY idx_books_rating (rating),
  CONSTRAINT fk_books_genre FOREIGN KEY (genre_id)
    REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_books_rating CHECK (rating BETWEEN 0 AND 5)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. movies
-- ------------------------------------------------------------
CREATE TABLE movies (
  movie_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title        VARCHAR(200) NOT NULL,
  director     VARCHAR(150) NOT NULL,
  description  TEXT         NOT NULL,
  genre_id     SMALLINT UNSIGNED NOT NULL,
  rating       DECIMAL(3,1) NOT NULL DEFAULT 0.0,     -- scale 0.0 - 10.0
  poster_image VARCHAR(500) NULL,
  release_year SMALLINT     NOT NULL,
  PRIMARY KEY (movie_id),
  KEY idx_movies_genre (genre_id),
  KEY idx_movies_rating (rating),
  CONSTRAINT fk_movies_genre FOREIGN KEY (genre_id)
    REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_movies_rating CHECK (rating BETWEEN 0 AND 10)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. mood_genres  (many-to-many: which genres suit which mood)
--    priority: 3 = best fit for the mood, 1 = weakest of the three
--    reason  : sentence reused in the "why recommended" text
-- ------------------------------------------------------------
CREATE TABLE mood_genres (
  mood_id  TINYINT UNSIGNED  NOT NULL,
  genre_id SMALLINT UNSIGNED NOT NULL,
  priority TINYINT UNSIGNED  NOT NULL DEFAULT 1,
  reason   VARCHAR(255)      NOT NULL,
  PRIMARY KEY (mood_id, genre_id),
  KEY idx_mood_genres_genre (genre_id),
  CONSTRAINT fk_mg_mood  FOREIGN KEY (mood_id)  REFERENCES moods  (mood_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id) REFERENCES genres (genre_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_mg_priority CHECK (priority BETWEEN 1 AND 3)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. favourites
--    Exactly one of book_id / movie_id must be set (CHECK).
--    The unique keys stop duplicate favourites; MySQL allows many
--    NULLs in a unique key, so they only apply to the filled column.
--    Note: book_id / movie_id use the default RESTRICT rule because
--    MySQL does not allow CASCADE on columns used in a CHECK.
--    Result: a book/movie that someone favourited cannot be deleted
--    until the favourites are removed (keeps data consistent).
-- ------------------------------------------------------------
CREATE TABLE favourites (
  favourite_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  book_id      INT UNSIGNED NULL,
  movie_id     INT UNSIGNED NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (favourite_id),
  UNIQUE KEY uq_fav_user_book  (user_id, book_id),
  UNIQUE KEY uq_fav_user_movie (user_id, movie_id),
  KEY idx_fav_book  (book_id),
  KEY idx_fav_movie (movie_id),
  CONSTRAINT fk_fav_user  FOREIGN KEY (user_id)  REFERENCES users  (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_book  FOREIGN KEY (book_id)  REFERENCES books  (book_id),
  CONSTRAINT fk_fav_movie FOREIGN KEY (movie_id) REFERENCES movies (movie_id),
  CONSTRAINT chk_fav_exactly_one CHECK (
    (book_id IS NOT NULL AND movie_id IS NULL) OR
    (book_id IS NULL AND movie_id IS NOT NULL)
  )
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. mood_history
-- ------------------------------------------------------------
CREATE TABLE mood_history (
  history_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  mood_id     TINYINT UNSIGNED NOT NULL,
  selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_history_user_time (user_id, selected_at),
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_history_mood FOREIGN KEY (mood_id) REFERENCES moods (mood_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. contact_messages
-- ------------------------------------------------------------
CREATE TABLE contact_messages (
  message_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  subject    VARCHAR(150) NOT NULL,
  message    TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id)
) ENGINE=InnoDB;
