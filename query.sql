-- Create users table
CREATE TABLE
    users (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        friend_code TEXT UNIQUE,
        profile_picture TEXT,
        banner TEXT,
        biography TEXT
    );

-- Create books table
CREATE TABLE
    books (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        author_id BIGINT,
        published BOOLEAN DEFAULT FALSE,
        cover_image TEXT,
        CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
    );

-- Create genres table
CREATE TABLE
    genres (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name TEXT UNIQUE NOT NULL
    );

-- Create book_genres table
CREATE TABLE
    book_genres (
        book_id BIGINT NOT NULL,
        genre_id BIGINT NOT NULL,
        PRIMARY KEY (book_id, genre_id),
        CONSTRAINT fk_book_genres_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
        CONSTRAINT fk_book_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
    );

-- Create chapters table
CREATE TABLE
    chapters (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        book_id BIGINT,
        published BOOLEAN DEFAULT FALSE,
        CONSTRAINT fk_chapters_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    );

-- Create books_likes table
CREATE TABLE
    books_likes (
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
        PRIMARY KEY (user_id, book_id),
        CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_likes_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    );

-- Create user_subscriptions table
CREATE TABLE
    user_subscriptions (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        follower_id BIGINT NOT NULL,
        CONSTRAINT fk_user_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_subscriptions_follower FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Create chapters_likes table
CREATE TABLE
    chapters_likes (
        user_id BIGINT NOT NULL,
        chapter_id BIGINT NOT NULL,
        PRIMARY KEY (user_id, chapter_id),
        CONSTRAINT fk_chapters_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_chapters_likes_chapter FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
    );

-- Create user_fav_genres table
CREATE TABLE
    user_fav_genres (
        user_id BIGINT NOT NULL,
        genre_id BIGINT NOT NULL,
        PRIMARY KEY (user_id, genre_id),
        CONSTRAINT fk_user_fav_genres_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_fav_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
    );

-- Create user_firebase_tokens table
CREATE TABLE
    user_firebase_tokens (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        firebase_token TEXT NOT NULL,
        CONSTRAINT fk_user_firebase_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Create user_friends table
CREATE TABLE
    user_friends (
        user_id BIGINT NOT NULL,
        friend_code TEXT NOT NULL,
        CONSTRAINT fk_user_friends_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_friends_friend_code FOREIGN KEY (friend_code) REFERENCES users (friend_code) ON DELETE CASCADE
    );

-- Create book_comments table
CREATE TABLE
    book_comments (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_book_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_book_comments_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    );

-- Create chapter_comments table
CREATE TABLE
    chapter_comments (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        chapter_id BIGINT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chapter_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_chapter_comments_chapter FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
    );

-- Create user_action_logs table
CREATE TABLE
    user_action_logs (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        action TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        CONSTRAINT fk_user_action_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Create chapter_paragraphs table
CREATE TABLE
    chapter_paragraphs (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        chapter_id BIGINT NOT NULL,
        paragraph_number INT NOT NULL,
        content TEXT NOT NULL,
        CONSTRAINT fk_chapter_paragraphs_chapter FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
    );

-- Create paragraph_comments table
CREATE TABLE
    paragraph_comments (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT NOT NULL,
        paragraph_id BIGINT NOT NULL,
        friend_code TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_paragraph_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_paragraph_comments_paragraph FOREIGN KEY (paragraph_id) REFERENCES chapter_paragraphs (id) ON DELETE CASCADE,
        CONSTRAINT fk_paragraph_comments_friend_code FOREIGN KEY (friend_code) REFERENCES users (friend_code) ON DELETE CASCADE
    );