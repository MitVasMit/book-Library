CREATE DATABASE IF NOT EXISTS book_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE book_library;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@example.com',
  -- Passwort: admin123 (hashed with bcrypt)
  '$2y$10$1UzXVfrOEdsjFql67/Mp2Oahd9YRY1O1yiEdMzoeAIuNyLcAfsr3u',
  'admin'
);

-- PASSWORD RESETS table
CREATE TABLE IF NOT EXISTS password_resets (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (email)
);

-- CATEGORIES table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
);

-- Insert initial categories
INSERT INTO categories (slug, name) VALUES
  ('computer_programming', 'Computer Programming'),
  ('science', 'Science'),
  ('history', 'History'),
  ('fantasy', 'Fantasy'),
  ('romance', 'Romance'),
  ('biography', 'Biography'),
  ('art', 'Art'),
  ('philosophy', 'Philosophy');

-- BOOKS table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  published_year YEAR,
  pages INT UNSIGNED,
  rating DECIMAL(2,1) DEFAULT 0,
  cover_image VARCHAR(255),
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT(1) DEFAULT 0,

  CONSTRAINT fk_category FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- PRIVATE COMMENTS table
CREATE TABLE IF NOT EXISTS private_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comment_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_book_comment (user_id, book_id)
);

-- REVIEWS table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_review_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- OPENLIBRARY RATINGS table for storing user ratings of OpenLibrary books
CREATE TABLE IF NOT EXISTS openlibrary_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_key VARCHAR(255) NOT NULL,
  book_title VARCHAR(255) NOT NULL,
  book_author VARCHAR(255) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_book (user_id, book_key)
);

-- RATINGS table for storing user ratings of database books
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_db_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_db_rating_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_db_book (user_id, book_id)
);

-- FAVORITES table for storing user book favorites
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorite_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_favorite_book (user_id, book_id)
);

-- populating 10 books for start
INSERT INTO books (title, author, description, published_year, pages, rating, cover_image, category_id)
VALUES
('Clean Code', 'Robert C. Martin', 'A Handbook of Agile Software Craftsmanship', 2008, 464, 4.7, 'clean_code.jpg', 1),
('A Brief History of Time', 'Stephen Hawking', 'A landmark volume in science writing.', 1988, 212, 4.6, 'brief_history.jpg', 2),
('Sapiens', 'Yuval Noah Harari', 'A brief history of humankind.', 2011, 443, 4.5, 'sapiens.jpg', 3),
('The Hobbit', 'J.R.R. Tolkien', 'A fantasy adventure that begins the Lord of the Rings.', 1937, 310, 4.8, 'hobbit.jpg', 4),
('Pride and Prejudice', 'Jane Austen', 'A romantic classic about manners and marriage.', 1813, 279, 4.4, 'pride_prejudice.jpg', 5),
('Steve Jobs', 'Walter Isaacson', 'Biography of Apple co-founder Steve Jobs.', 2011, 656, 4.6, 'steve_jobs.jpg', 6),
('The Story of Art', 'E.H. Gombrich', 'One of the best introductions to art history.', 1950, 688, 4.3, 'story_of_art.jpg', 7),
('The Republic', 'Plato', 'Foundational philosophical text on justice and society.', -380, 416, 4.2, 'republic.jpg', 8),
('You Don’t Know JS', 'Kyle Simpson', 'Deep dive into JavaScript mechanics.', 2015, 278, 4.5, 'ydkjs.jpg', 1),
('Astrophysics for People in a Hurry', 'Neil deGrasse Tyson', 'A quick introduction to modern astrophysics.', 2017, 224, 4.1, 'astrophysics.jpg', 2);
