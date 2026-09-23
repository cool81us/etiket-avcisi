-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    full_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Öğrenci ilerleme tablosu (seviye bazlı)
CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    stars INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    correct_rate REAL DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    last_attempt DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, level_id)
);

-- Öğrenci genel istatistikleri
CREATE TABLE IF NOT EXISTS student_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    total_score INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    xp_level INTEGER DEFAULT 1,
    max_streak INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_wrong INTEGER DEFAULT 0,
    total_play_time INTEGER DEFAULT 0,
    last_played DATETIME,
    badges TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hata geçmişi
CREATE TABLE IF NOT EXISTS error_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    error_type TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Soru cevaplama geçmişi
CREATE TABLE IF NOT EXISTS question_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    correct INTEGER DEFAULT 0,
    try_number INTEGER DEFAULT 1,
    hint_used INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, level_id, question_id)
);

-- İpucu kullanım istatistikleri
CREATE TABLE IF NOT EXISTS hint_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, level_id, tag_name)
);

-- Soru ozellestirme (ogretmen override)
CREATE TABLE IF NOT EXISTS question_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    question_json TEXT NOT NULL,
    is_new INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(level_id, question_id)
);

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_error_history_user ON error_history(user_id);
CREATE INDEX IF NOT EXISTS idx_question_history_user ON question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_hint_stats_user ON hint_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_question_overrides_level ON question_overrides(level_id);
