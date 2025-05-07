const seedOwner = require('./seedOwner');
const { seedLoyaltyData } = require('./seedLoyaltyData'); // Import the new function
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const config = require('./config/config');

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
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes'); // Add this to your imports
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Add this to your imports
const returnRoutes = require('./routes/returnRoutes'); // This should already be in your file, but make sure it's there
const uploadRoutes = require('./routes/uploadRoutes'); // Add this with your other require statements
const marketingRoutes = require('./routes/marketingRoutes'); // Add this to your imports

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', require('./routes/inventoryRoutes')); // Make sure this line exists in your app.js or server.js file
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/financial', financialRoutes); // Add this to your routes configuration
app.use('/api/returns', returnRoutes); // This should already be in your file, but make sure it's there
app.use('/api/upload', uploadRoutes); // Add this with your other app.use statements
app.use('/api/marketing', marketingRoutes); // Add this to your routes configuration

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test route at root
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API server is running' });
});

// Serve static files from React app (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function to test database connection
async function checkConnection() {
  try {
    const connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });
    
    console.log('Database connection successful');
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Function to test database connection and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await checkConnection();
    
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
Promise.all([seedOwner(), seedLoyaltyData()]) // Include the new seeding function
  .then(() => startServer())
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });