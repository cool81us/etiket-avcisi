module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'etiket-avcisi-secret-key-change-in-production',
  jwtExpiresIn: '7d',
  bcryptRounds: 10,
  dbPath: './db/etiket-avcisi.db',
  maxErrorHistory: 100,
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
};
