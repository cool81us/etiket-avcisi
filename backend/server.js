const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('./db/database');

async function startServer() {
    // Veritabanını başlat
    await initDatabase();
    console.log('Veritabanı başlatıldı');

    const app = express();

    // Güvenlik
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    // CORS
    app.use(cors({
        origin: config.corsOrigins,
        credentials: true
    }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }
    });
    app.use('/api/', limiter);

    // Daha sıkı limit auth rotaları için
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);

    // Frontend dosyalarını sun
    app.use(express.static(path.join(__dirname, '..')));

    // API rotalari
    const authRoutes = require('./routes/auth');
    const studentRoutes = require('./routes/student');
    const teacherRoutes = require('./routes/teacher');
    const questionRoutes = require('./routes/questions');

    app.use('/api/auth', authRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/teacher', teacherRoutes);
    app.use('/api/questions', questionRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 404 handler
    app.use('/api/*', (req, res) => {
        res.status(404).json({ error: 'API endpointi bulunamadı' });
    });

    // SPA fallback
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error('Sunucu hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası oluştu' });
    });

    // Sunucuyu başlat
    app.listen(config.port, () => {
        console.log(`Etiket Avcısı backend sunucusu http://localhost:${config.port} adresinde çalışıyor`);
        console.log(`API: http://localhost:${config.port}/api`);
        console.log(`Frontend: http://localhost:${config.port}/`);
    });
}

startServer().catch(err => {
    console.error('Sunucu başlatma hatası:', err);
    process.exit(1);
});
