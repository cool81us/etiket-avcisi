const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Kayıt
router.post('/register', (req, res) => {
    try {
        const db = getDb();
        const { username, email, password, fullName, role } = req.body;

        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalıdır' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
        }

        const validRoles = ['student', 'teacher'];
        const userRole = validRoles.includes(role) ? role : 'student';

        const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existingUser) {
            return res.status(409).json({ error: 'Kullanıcı adı veya e-posta zaten mevcut' });
        }

        const passwordHash = bcrypt.hashSync(password, config.bcryptRounds);

        const result = db.prepare(
            'INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)'
        ).run(username, email, passwordHash, userRole, fullName);

        // Öğrenci ise varsayılan istatistikler oluştur
        if (userRole === 'student') {
            db.prepare('INSERT INTO student_stats (user_id) VALUES (?)').run(result.lastInsertRowid);
        }

        const token = jwt.sign(
            { userId: result.lastInsertRowid, role: userRole },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: {
                id: result.lastInsertRowid,
                username,
                email,
                role: userRole,
                fullName
            }
        });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Giriş
router.post('/login', (req, res) => {
    try {
        const db = getDb();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
        if (!user) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // Son giriş zamanını güncelle
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            }
        });
    } catch (err) {
        console.error('Giriş hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Mevcut kullanıcı bilgisi
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
