const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../db/database');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const db = getDb();
        const user = db.prepare('SELECT id, username, email, role, full_name FROM users WHERE id = ?').get(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
        }
        next();
    };
}

module.exports = { authenticate, authorize };
