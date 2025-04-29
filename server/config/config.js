const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  environment: process.env.NODE_ENV || 'development'
};