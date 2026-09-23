const express = require('express');
const { getDb } = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Soru tipleri ve zorunlu alanlar
const QUESTION_TYPES = ['multiple-choice', 'code-fill', 'code-write', 'code-fix', 'predict'];

function validateQuestion(q) {
    if (!q || typeof q !== 'object') return 'Soru verisi gerekli';
    if (!QUESTION_TYPES.includes(q.type)) return 'Gecersiz soru tipi';
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) return 'Soru metni gerekli';

    if (q.type === 'multiple-choice' || q.type === 'predict') {
        if (!Array.isArray(q.options) || q.options.length < 2) return 'En az 2 secenek gerekli';
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) return 'Gecersiz dogru cevap indeksi';
    }

    if (q.type === 'code-fill') {
        if (!Array.isArray(q.template) || q.template.length === 0) return 'Kod sablonu gerekli';
        if (!Array.isArray(q.blanks) || q.blanks.length === 0) return 'En az bir bosluk (blank) gerekli';
        const blankCount = q.template.join('\n').split('____').length - 1;
        if (blankCount !== q.blanks.length) return 'Sablon icindeki ____ sayisi blanks sayisiyla eslesmeli';
    }

    if (q.type === 'code-fix') {
        if (!Array.isArray(q.code) || q.code.length === 0) return 'Hatali kod satirlari gerekli';
        if (!Array.isArray(q.errors) || q.errors.length === 0) return 'En az bir hata tanimi gerekli';
    }

    if (q.type === 'code-write') {
        if (!q.validation || typeof q.validation !== 'object') return 'Validation nesnesi gerekli';
        if (!Array.isArray(q.requirements)) q.requirements = [];
    }

    return null;
}

// GET /api/questions/overrides - Tüm override'lari getir (giris yapilmis tum kullanicilar)
router.get('/overrides', authenticate, (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare(`
            SELECT level_id, question_id, question_json, is_new, is_deleted, updated_at
            FROM question_overrides
            ORDER BY level_id, question_id
        `).all();

        const overrides = rows.map(r => ({
            levelId: r.level_id,
            questionId: r.question_id,
            question: r.is_deleted ? null : JSON.parse(r.question_json),
            isNew: !!r.is_new,
            isDeleted: !!r.is_deleted,
            updatedAt: r.updated_at
        }));

        res.json({ overrides });
    } catch (err) {
        console.error('Override listesi hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// PUT /api/questions/overrides - Soru guncelle (ogretmen)
router.put('/overrides', authenticate, authorize('teacher'), (req, res) => {
    try {
        const { levelId, questionId, question } = req.body;

        if (!Number.isInteger(levelId) || levelId < 1) {
            return res.status(400).json({ error: 'Gecersiz seviye ID' });
        }
        if (!Number.isInteger(questionId) || questionId < 1) {
            return res.status(400).json({ error: 'Gecersiz soru ID' });
        }

        const validationError = validateQuestion(question);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const db = getDb();
        const questionJson = JSON.stringify(question);

        db.prepare(`
            INSERT INTO question_overrides (level_id, question_id, question_json, is_new, is_deleted, updated_by, updated_at)
            VALUES (?, ?, ?, 0, 0, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(level_id, question_id) DO UPDATE SET
                question_json = excluded.question_json,
                is_new = 0,
                is_deleted = 0,
                updated_by = excluded.updated_by,
                updated_at = CURRENT_TIMESTAMP
        `).run(levelId, questionId, questionJson, req.user.id);

        res.json({ message: 'Soru guncellendi' });
    } catch (err) {
        console.error('Soru guncelleme hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// POST /api/questions/overrides - Yeni soru ekle (ogretmen)
router.post('/overrides', authenticate, authorize('teacher'), (req, res) => {
    try {
        const { levelId, question } = req.body;

        if (!Number.isInteger(levelId) || levelId < 1) {
            return res.status(400).json({ error: 'Gecersiz seviye ID' });
        }

        const validationError = validateQuestion(question);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const db = getDb();

        // Bu seviyedeki max soru ID'sini bul (hem orijinal hem override)
        // Orijinal levels.js'teki ID'leri bilmiyoruz, sadece override'lara bakip
        // client'tan gelen question.id'yi kullan
        const newId = Number.isInteger(question.id) && question.id > 0
            ? question.id
            : null;

        if (!newId) {
            return res.status(400).json({ error: 'Yeni soru icin id gerekli' });
        }

        // Ayni ID zaten var mi?
        const existing = db.prepare(
            'SELECT id FROM question_overrides WHERE level_id = ? AND question_id = ?'
        ).get(levelId, newId);

        if (existing) {
            return res.status(409).json({ error: 'Bu soru ID zaten kullaniliyor' });
        }

        const questionJson = JSON.stringify(question);

        db.prepare(`
            INSERT INTO question_overrides (level_id, question_id, question_json, is_new, is_deleted, updated_by, updated_at)
            VALUES (?, ?, ?, 1, 0, ?, CURRENT_TIMESTAMP)
        `).run(levelId, newId, questionJson, req.user.id);

        res.status(201).json({ message: 'Soru eklendi', questionId: newId });
    } catch (err) {
        console.error('Soru ekleme hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// DELETE /api/questions/overrides - Soru sil (ogretmen)
// Body: { levelId, questionId, isNew }
router.delete('/overrides', authenticate, authorize('teacher'), (req, res) => {
    try {
        const { levelId, questionId, isNew } = req.body;

        if (!Number.isInteger(levelId) || !Number.isInteger(questionId)) {
            return res.status(400).json({ error: 'Gecersiz seviye veya soru ID' });
        }

        const db = getDb();

        if (isNew) {
            // Yeni eklenen soruyu tamamen sil
            db.prepare(
                'DELETE FROM question_overrides WHERE level_id = ? AND question_id = ? AND is_new = 1'
            ).run(levelId, questionId);
        } else {
            // Orijinal soruyu is_deleted olarak isaretle
            // Varsa var olan override'i guncelle, yoksa yeni satir olustur
            const existing = db.prepare(
                'SELECT id, question_json, is_new FROM question_overrides WHERE level_id = ? AND question_id = ?'
            ).get(levelId, questionId);

            if (existing && existing.is_new) {
                db.prepare(
                    'DELETE FROM question_overrides WHERE level_id = ? AND question_id = ?'
                ).run(levelId, questionId);
            } else if (existing) {
                db.prepare(`
                    UPDATE question_overrides SET
                        is_deleted = 1,
                        updated_by = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE level_id = ? AND question_id = ?
                `).run(req.user.id, levelId, questionId);
            } else {
                db.prepare(`
                    INSERT INTO question_overrides (level_id, question_id, question_json, is_new, is_deleted, updated_by, updated_at)
                    VALUES (?, ?, '{}', 0, 1, ?, CURRENT_TIMESTAMP)
                `).run(levelId, questionId, req.user.id);
            }
        }

        res.json({ message: 'Soru silindi' });
    } catch (err) {
        console.error('Soru silme hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// DELETE /api/questions/overrides/reset - Bir seviyedeki veya tum override'lari sifirla (ogretmen)
// Query: ?levelId=1 (opsiyonel - yoksa tumu)
router.delete('/overrides/reset', authenticate, authorize('teacher'), (req, res) => {
    try {
        const db = getDb();
        const levelId = req.query.levelId ? parseInt(req.query.levelId) : null;

        if (levelId) {
            db.prepare('DELETE FROM question_overrides WHERE level_id = ?').run(levelId);
            res.json({ message: `Seviye ${levelId} sorulari orijinaline donduruldu` });
        } else {
            db.prepare('DELETE FROM question_overrides').run();
            res.json({ message: 'Tum sorular orijinaline donduruldu' });
        }
    } catch (err) {
        console.error('Sifirlama hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

module.exports = router;
