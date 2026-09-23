const express = require('express');
const { getDb } = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('teacher'));

// Tüm öğrencileri listele
router.get('/students', (req, res) => {
    try {
        const db = getDb();
        const students = db.prepare(`
            SELECT u.id, u.username, u.email, u.full_name, u.created_at, u.last_login,
                   COALESCE(s.total_score, 0) as total_score,
                   COALESCE(s.xp, 0) as xp,
                   COALESCE(s.xp_level, 1) as xp_level,
                   COALESCE(s.max_streak, 0) as max_streak,
                   COALESCE(s.total_correct, 0) as total_correct,
                   COALESCE(s.total_wrong, 0) as total_wrong,
                   COALESCE(s.total_play_time, 0) as total_play_time,
                   s.last_played
            FROM users u
            LEFT JOIN student_stats s ON u.id = s.user_id
            WHERE u.role = 'student'
            ORDER BY u.created_at DESC
        `).all();

        // Tamamlanan seviye sayısını ekle
        const completedCounts = db.prepare(`
            SELECT user_id, COUNT(*) as completed_count
            FROM student_progress WHERE completed = 1
            GROUP BY user_id
        `).all();

        const completedMap = {};
        completedCounts.forEach(c => { completedMap[c.user_id] = c.completed_count; });

        const studentsWithProgress = students.map(s => ({
            ...s,
            completedLevels: completedMap[s.id] || 0
        }));

        res.json({ students: studentsWithProgress });
    } catch (err) {
        console.error('Öğrenci listesi hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Belirli bir öğrencinin detaylarını getir
router.get('/students/:id', (req, res) => {
    try {
        const db = getDb();
        const studentId = parseInt(req.params.id);

        const student = db.prepare(`
            SELECT u.id, u.username, u.email, u.full_name, u.created_at, u.last_login,
                   COALESCE(s.total_score, 0) as total_score,
                   COALESCE(s.xp, 0) as xp,
                   COALESCE(s.xp_level, 1) as xp_level,
                   COALESCE(s.max_streak, 0) as max_streak,
                   COALESCE(s.total_correct, 0) as total_correct,
                   COALESCE(s.total_wrong, 0) as total_wrong,
                   COALESCE(s.total_play_time, 0) as total_play_time,
                   s.last_played, s.badges
            FROM users u
            LEFT JOIN student_stats s ON u.id = s.user_id
            WHERE u.id = ? AND u.role = 'student'
        `).get(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Öğrenci bulunamadı' });
        }

        // Seviye detaylarını getir
        const progress = db.prepare('SELECT * FROM student_progress WHERE user_id = ? ORDER BY level_id').all(studentId);

        // Son hataları getir
        const recentErrors = db.prepare('SELECT * FROM error_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20').all(studentId);

        res.json({ student, progress, recentErrors });
    } catch (err) {
        console.error('Öğrenci detay hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Öğrencinin ilerleme detaylarını getir
router.get('/students/:id/progress', (req, res) => {
    try {
        const db = getDb();
        const studentId = parseInt(req.params.id);
        const progress = db.prepare('SELECT * FROM student_progress WHERE user_id = ? ORDER BY level_id').all(studentId);
        res.json({ progress });
    } catch (err) {
        console.error('İlerleme detay hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Sınıf istatistiklerini getir
router.get('/stats', (req, res) => {
    try {
        const db = getDb();
        const totalStudents = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('student');

        const avgScore = db.prepare('SELECT AVG(total_score) as avg FROM student_stats').get();
        const avgXp = db.prepare('SELECT AVG(xp) as avg FROM student_stats').get();

        const levelStats = db.prepare(`
            SELECT level_id, COUNT(*) as attempt_count, AVG(correct_rate) as avg_rate
            FROM student_progress WHERE completed = 1
            GROUP BY level_id ORDER BY level_id
        `).all();

        const topStudents = db.prepare(`
            SELECT u.full_name, s.total_score, s.xp, s.max_streak
            FROM users u JOIN student_stats s ON u.id = s.user_id
            WHERE u.role = 'student'
            ORDER BY s.total_score DESC LIMIT 10
        `).all();

        res.json({
            totalStudents: totalStudents.count,
            averageScore: Math.round(avgScore.avg || 0),
            averageXp: Math.round(avgXp.avg || 0),
            levelStats,
            topStudents
        });
    } catch (err) {
        console.error('Sınıf istatistik hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
