const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// Simple API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
router.get('/db-check', async (req, res) => {
  try {
    await executeQuery('SELECT 1');
    res.json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Get environment info (exclude sensitive data)
router.get('/env', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000'
  });
});

module.exports = router;