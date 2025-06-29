const seedOwner = require('./seedOwner');
// Import the new function
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const config = require('./config/config');
const { executeQuery } = require('./config/db');
// Import the trigger update function
const { updateTriggers } = require('./config/triggerSetup');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS - Add this before other middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Disposition', 'Content-Length'],
  credentials: true
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Completely disable crossOriginResourcePolicy for PDF downloads
}));

// Special handling for OPTIONS requests to PDF endpoints
app.options('/api/purchase-orders/:id/pdf', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '600');
  res.sendStatus(204);
});

// Add a middleware specifically for handling inventory PDF routes properly
app.use('/api/inventory/stock-movements/pdf', (req, res, next) => {
  // Set CORS headers for all inventory PDF requests
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');
  
  // Handle OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  // For other request methods, continue to the actual route handlers
  next();
});

// Add middleware for inventory turnover report PDF
app.use('/api/inventory/turnover-report/pdf', (req, res, next) => {
  // Set CORS headers for inventory turnover PDF requests
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');
  
  // Handle OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  // For other request methods, continue to the actual route handlers
  next();
});

// Special OPTIONS handler for inventory turnover report PDF
app.options('/api/inventory/turnover-report/pdf', (req, res) => {
  // Set all necessary CORS headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Respond with 204 No Content
  return res.sendStatus(204);
});

// Logging and parsing middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Define PO number generator function
const generatePONumber = async () => {
  try {
    // Generate a 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const poNumber = `PO-${randomNum}`;
    
    // Check if this PO number already exists
    const existingPO = await executeQuery(
      'SELECT 1 FROM purchase_orders WHERE po_number = ?', 
      [poNumber]
    );
    
    // If it exists, recursively try again with a new random number
    if (existingPO && existingPO.length > 0) {
      return generatePONumber();
    }
    
    return poNumber;
  } catch (error) {
    console.error('Error generating PO number:', error);
    // Fallback with timestamp to ensure uniqueness
    return `PO-${Date.now().toString().substring(3, 9)}`;
  }
};

// Add the PO number generation route BEFORE other routes
app.get('/api/generate-po-number', async (req, res) => {
  try {
    console.log('Generate PO Number route hit');
    const poNumber = await generatePONumber();
    res.json({ poNumber });
  } catch (error) {
    console.error('Error generating PO number:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const debugRoutes = require('./routes/debugRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes'); 
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const financialRoutes = require('./routes/financialRoutes'); 
const returnRoutes = require('./routes/returnRoutes'); 
const uploadRoutes = require('./routes/uploadRoutes'); 
const marketingRoutes = require('./routes/marketingRoutes'); 
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/categories', categoryRoutes);

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
} else {
  // In development mode, still serve index.html for non-API routes to support React Router
  // This allows refreshing the page to work correctly
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // For all other routes, serve the React app
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Debug route to list all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const routePath = handler.route.path;
          const basePath = middleware.path || '';
          routes.push({
            path: `${basePath}${routePath}`,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Direct test route for the single email functionality
app.post('/api/test/send-single/:id', (req, res) => {
  console.log('Test route hit:', req.params.id, req.body);
  res.json({ 
    success: true, 
    message: 'Test route hit successfully',
    params: req.params,
    body: req.body
  });
});

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
    
    // Update database triggers
    try {
      await updateTriggers();
      console.log('✅ Database triggers updated successfully');
    } catch (err) {
      console.error('⚠️ Warning: Failed to update database triggers:', err);
      // We continue even if trigger update fails, it's not critical
    }
    
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
Promise.all([seedOwner()]) // Include the new seeding function
  .then(() => startServer())
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });