const express = require('express');
const { getDb } = require('../db/database');
const config = require('../config');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm student rotaları kimlik doğrulama gerektirir
router.use(authenticate);
router.use(authorize('student'));

// Profil bilgisi
router.get('/profile', (req, res) => {
    try {
        const db = getDb();
        const stats = db.prepare('SELECT * FROM student_stats WHERE user_id = ?').get(req.user.id);
        res.json({
            user: req.user,
            stats: stats || {
                total_score: 0, xp: 0, xp_level: 1, max_streak: 0,
                total_correct: 0, total_wrong: 0, total_play_time: 0,
                last_played: null, badges: '[]'
            }
        });
    } catch (err) {
        console.error('Profil hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Tüm seviye ilerlemelerini getir
router.get('/progress', (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM student_progress WHERE user_id = ? ORDER BY level_id').all(req.user.id);
        res.json({ progress: rows });
    } catch (err) {
        console.error('İlerleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Tek seviye ilerlemesini getir
router.get('/progress/:levelId', (req, res) => {
    try {
        const db = getDb();
        const levelId = parseInt(req.params.levelId);
        const row = db.prepare('SELECT * FROM student_progress WHERE user_id = ? AND level_id = ?').get(req.user.id, levelId);
        res.json({ progress: row || null });
    } catch (err) {
        console.error('Seviye ilerleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Seviye ilerlemesini güncelle (kaydet)
router.put('/progress/:levelId', (req, res) => {
    try {
        const db = getDb();
        const levelId = parseInt(req.params.levelId);
        const { stars, score, completed, attempts, timeSpent, hintsUsed, correctRate, xpEarned } = req.body;

        const existing = db.prepare('SELECT * FROM student_progress WHERE user_id = ? AND level_id = ?').get(req.user.id, levelId);

        if (existing) {
            db.prepare(`
                UPDATE student_progress SET
                    stars = MAX(?, stars),
                    score = MAX(?, score),
                    completed = MAX(?, completed),
                    attempts = ?,
                    time_spent = ?,
                    hints_used = ?,
                    correct_rate = MAX(?, correct_rate),
                    xp_earned = ?,
                    last_attempt = CURRENT_TIMESTAMP
                WHERE user_id = ? AND level_id = ?
            `).run(
                stars || 0, score || 0, completed ? 1 : 0,
                attempts || existing.attempts,
                timeSpent || 0, hintsUsed || 0,
                correctRate || 0, xpEarned || 0,
                req.user.id, levelId
            );
        } else {
            db.prepare(`
                INSERT INTO student_progress (user_id, level_id, stars, score, completed, attempts, time_spent, hints_used, correct_rate, xp_earned, last_attempt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(req.user.id, levelId, stars || 0, score || 0, completed ? 1 : 0, attempts || 1, timeSpent || 0, hintsUsed || 0, correctRate || 0, xpEarned || 0);
        }

        res.json({ message: 'İlerleme güncellendi' });
    } catch (err) {
        console.error('İlerleme güncelleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Genel istatistikleri getir
router.get('/stats', (req, res) => {
    try {
        const db = getDb();
        const stats = db.prepare('SELECT * FROM student_stats WHERE user_id = ?').get(req.user.id);
        res.json({ stats: stats || null });
    } catch (err) {
        console.error('İstatistik hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// İstatistikleri güncelle
router.put('/stats', (req, res) => {
    try {
        const db = getDb();
        const { totalScore, xp, xpLevel, maxStreak, totalCorrect, totalWrong, totalPlayTime, lastPlayed, badges } = req.body;

        const existing = db.prepare('SELECT * FROM student_stats WHERE user_id = ?').get(req.user.id);

        if (existing) {
            db.prepare(`
                UPDATE student_stats SET
                    total_score = ?, xp = ?, xp_level = ?,
                    max_streak = MAX(?, max_streak),
                    total_correct = ?, total_wrong = ?,
                    total_play_time = ?, last_played = ?,
                    badges = ?
                WHERE user_id = ?
            `).run(
                totalScore || 0, xp || 0, xpLevel || 1,
                maxStreak || 0,
                totalCorrect || 0, totalWrong || 0,
                totalPlayTime || 0, lastPlayed || null,
                JSON.stringify(badges || []),
                req.user.id
            );
        } else {
            db.prepare(`
                INSERT INTO student_stats (user_id, total_score, xp, xp_level, max_streak, total_correct, total_wrong, total_play_time, last_played, badges)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                req.user.id, totalScore || 0, xp || 0, xpLevel || 1,
                maxStreak || 0, totalCorrect || 0, totalWrong || 0,
                totalPlayTime || 0, lastPlayed || null,
                JSON.stringify(badges || [])
            );
        }

        res.json({ message: 'İstatistikler güncellendi' });
    } catch (err) {
        console.error('İstatistik güncelleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Hata kaydet
router.post('/errors', (req, res) => {
    try {
        const db = getDb();
        const { levelId, questionId, errorType, tagName } = req.body;

        // Kullanıcının toplam hata sayısını kontrol et
        const count = db.prepare('SELECT COUNT(*) as cnt FROM error_history WHERE user_id = ?').get(req.user.id);

        if (count.cnt >= config.maxErrorHistory) {
            // En eski hatayı sil
            db.prepare('DELETE FROM error_history WHERE user_id = ? AND id = (SELECT id FROM error_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT 1)').run(req.user.id, req.user.id);
        }

        db.prepare(`
            INSERT INTO error_history (user_id, level_id, question_id, error_type, tag_name)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.user.id, levelId, questionId, errorType, tagName);

        res.json({ message: 'Hata kaydedildi' });
    } catch (err) {
        console.error('Hata kaydetme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Hata geçmişini getir
router.get('/errors', (req, res) => {
    try {
        const db = getDb();
        const errors = db.prepare('SELECT * FROM error_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100').all(req.user.id);
        res.json({ errors });
    } catch (err) {
        console.error('Hata geçmişi hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Soru cevabı kaydet
router.post('/questions', (req, res) => {
    try {
        const db = getDb();
        const { levelId, questionId, correct, tryNumber, hintUsed, timeSpent } = req.body;

        db.prepare(`
            INSERT OR REPLACE INTO question_history (user_id, level_id, question_id, correct, try_number, hint_used, time_spent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(req.user.id, levelId, questionId, correct ? 1 : 0, tryNumber || 1, hintUsed ? 1 : 0, timeSpent || 0);

        res.json({ message: 'Soru cevabı kaydedildi' });
    } catch (err) {
        console.error('Soru kaydetme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Soru geçmişini getir
router.get('/questions', (req, res) => {
    try {
        const db = getDb();
        const questions = db.prepare('SELECT * FROM question_history WHERE user_id = ? ORDER BY timestamp DESC').all(req.user.id);
        res.json({ questions });
    } catch (err) {
        console.error('Soru geçmişi hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// İpucu istatistiği kaydet
router.post('/hints', (req, res) => {
    try {
        const db = getDb();
        const { levelId, tagName } = req.body;

        const existing = db.prepare('SELECT * FROM hint_stats WHERE user_id = ? AND level_id = ? AND tag_name = ?').get(req.user.id, levelId, tagName);

        if (existing) {
            db.prepare('UPDATE hint_stats SET count = count + 1 WHERE user_id = ? AND level_id = ? AND tag_name = ?').run(req.user.id, levelId, tagName);
        } else {
            db.prepare('INSERT INTO hint_stats (user_id, level_id, tag_name, count) VALUES (?, ?, ?, 1)').run(req.user.id, levelId, tagName);
        }

        res.json({ message: 'İpucu istatistiği kaydedildi' });
    } catch (err) {
        console.error('İpucu kaydetme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Rozet ekle
router.post('/badges', (req, res) => {
    try {
        const db = getDb();
        const { badgeId } = req.body;

        const stats = db.prepare('SELECT badges FROM student_stats WHERE user_id = ?').get(req.user.id);
        const badges = stats ? JSON.parse(stats.badges || '[]') : [];

        if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            db.prepare('UPDATE student_stats SET badges = ? WHERE user_id = ?').run(JSON.stringify(badges), req.user.id);
        }

        res.json({ message: 'Rozet eklendi', badges });
    } catch (err) {
        console.error('Rozet ekleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Rozetleri getir
router.get('/badges', (req, res) => {
    try {
        const db = getDb();
        const stats = db.prepare('SELECT badges FROM student_stats WHERE user_id = ?').get(req.user.id);
        const badges = stats ? JSON.parse(stats.badges || '[]') : [];
        res.json({ badges });
    } catch (err) {
        console.error('Rozet hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
