const express = require('express');
const { getDb } = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

function normalizeCode(code) {
    return String(code == null ? '' : code).trim().toUpperCase();
}

function validateCodeInput(code, levelId) {
    if (!code) return 'Kod gerekli';
    if (code.length < 3 || code.length > 30) return 'Kod 3-30 karakter arasinda olmali';
    if (!/^[A-Z0-9_-]+$/.test(code)) return 'Kod yalnizca harf, rakam, - ve _ icerebilir';
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > config.maxLevels) {
        return 'Gecersiz seviye (1-' + config.maxLevels + ')';
    }
    return null;
}

// POST /api/codes/redeem - Kodu dogrula, acilan seviyeyi dondur (giris zorunlu degil)
router.post('/redeem', (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        if (!code) {
            return res.status(400).json({ error: 'Kod gerekli' });
        }

        const db = getDb();
        const row = db.prepare('SELECT level_id FROM level_codes WHERE code = ?').get(code);

        if (!row) {
            return res.status(404).json({ error: 'Gecersiz kod. Kodu kontrol edip tekrar deneyin.' });
        }

        res.json({ levelId: row.level_id });
    } catch (err) {
        console.error('Kod dogrulama hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// GET /api/codes - Tum kodlari listele (ogretmen)
router.get('/', authenticate, authorize('teacher'), (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare(`
            SELECT id, code, level_id, created_by, created_at
            FROM level_codes
            ORDER BY level_id, code
        `).all();

        const codes = rows.map(r => ({
            id: r.id,
            code: r.code,
            levelId: r.level_id,
            createdBy: r.created_by,
            createdAt: r.created_at
        }));

        res.json({ codes });
    } catch (err) {
        console.error('Kod listesi hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// POST /api/codes - Yeni kod olustur (ogretmen)
router.post('/', authenticate, authorize('teacher'), (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        const levelId = req.body.levelId;

        const validationError = validateCodeInput(code, levelId);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const db = getDb();
        const existing = db.prepare('SELECT id FROM level_codes WHERE code = ?').get(code);
        if (existing) {
            return res.status(409).json({ error: 'Bu kod zaten kullaniliyor' });
        }

        db.prepare(
            'INSERT INTO level_codes (code, level_id, created_by) VALUES (?, ?, ?)'
        ).run(code, levelId, req.user.id);

        res.status(201).json({ message: 'Kod olusturuldu', code, levelId });
    } catch (err) {
        console.error('Kod olusturma hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

// DELETE /api/codes/:id - Kodu sil (ogretmen)
router.delete('/:id', authenticate, authorize('teacher'), (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: 'Gecersiz kod ID' });
        }

        const db = getDb();
        const existing = db.prepare('SELECT id FROM level_codes WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Kod bulunamadi' });
        }

        db.prepare('DELETE FROM level_codes WHERE id = ?').run(id);
        res.json({ message: 'Kod silindi' });
    } catch (err) {
        console.error('Kod silme hatasi:', err);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

module.exports = router;
