const seedOwner = require('./seedOwner');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { checkConnection } = require('./config/db');  // Changed from testConnection to checkConnection
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging and parsing middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const debugRoutes = require('./routes/debugRoutes');
const customerRoutes = require('./routes/customerRoutes'); // Add this to your imports
const inventoryRoutes = require('./routes/inventoryRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Add this to your imports

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/customers', customerRoutes); // Add this to your routes configuration
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/financial', financialRoutes); // Add this to your routes configuration

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from React app (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Function to test database connection and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await checkConnection();  // Use checkConnection instead of testConnection
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`
        🚀 Server running on port ${PORT}
        🌱 Environment: ${process.env.NODE_ENV || 'development'}
        💾 Database: ${process.env.DB_NAME || 'default_db'}@${process.env.DB_HOST || 'localhost'}
        🌍 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
seedOwner()
  .then(() => startServer())
  .catch(err => {
    console.error('Owner seeding failed:', err);
    process.exit(1);
  });