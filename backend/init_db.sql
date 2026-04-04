-- PostgreSQL: Test jadvali va default testlar
-- pgAdmin yoki psql orqali postgres database'da bajarish

-- Jadvalar (SQLAlchemy avtomatik yaratadi, lekin qo'lda kerak bo'lsa)
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    name VARCHAR(200) NOT NULL,
    "order" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES sections(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL
);

-- Default o'yinlar (id conflict bo'lsa o'tkazib yuboriladi)
INSERT INTO games (id, name, slug) VALUES
(1, 'Baraban', 'wheel'),
(2, 'Arqon tortish', 'tug_of_war'),
(3, 'So''z qidiruv', 'word_search'),
(4, 'Davlatni top', 'country'),
(5, 'Chempion o''quvchi', 'champion'),
(6, 'Viktorina', 'quiz'),
(7, 'Millioner', 'millionaire'),
(8, 'Xotira o''yini', 'memory'),
(9, 'Tezkor hisob', 'math'),
(10, 'So''z topish', 'word')
ON CONFLICT (id) DO NOTHING;

