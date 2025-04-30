const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrms',
    port: process.env.DB_PORT || 3306
  },
  environment: process.env.NODE_ENV || 'development'
};