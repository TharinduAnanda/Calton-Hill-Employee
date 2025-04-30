const express = require('express');
const router = express.Router();

// Summary endpoint for staff dashboard
router.get('/summary', (req, res) => {
  // Return mock dashboard data directly from server
  // This can be replaced with actual database queries later
  res.json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: {
      summary: {
        pendingTasks: 4,
        lowStockItems: 7,
        activeOrders: 12,
        totalProducts: 156,
        dailySales: 2350.75,
        mostSoldCategory: 'Power Tools'
      },
      recentTasks: [
        { 
          id: 1, 
          name: 'Restock Inventory', 
          status: 'pending', 
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          description: 'Restock power tools section'
        },
        { 
          id: 2, 
          name: 'Update Product Prices', 
          status: 'completed', 
          dueDate: new Date().toISOString(),
          description: 'Update prices for new product line'
        },
        { 
          id: 3, 
          name: 'Customer Follow-up', 
          status: 'in progress', 
          dueDate: new Date(Date.now() + 172800000).toISOString(),
          description: 'Follow up with recent customers about satisfaction'
        }
      ],
      lowStockItems: [
        { id: 1, name: 'Power Drill', quantity: 3, reorderThreshold: 10, sku: 'PD-001', supplier: 'Tools Inc.' },
        { id: 2, name: 'Pipe Fittings', quantity: 5, reorderThreshold: 20, sku: 'PF-120', supplier: 'Plumbing Supplies Ltd.' },
        { id: 3, name: 'Electrical Tape', quantity: 2, reorderThreshold: 15, sku: 'ET-033', supplier: 'Electrical Goods Co.' }
      ],
      salesData: [
        { month: 'Jan', sales: 4000 },
        { month: 'Feb', sales: 3000 },
        { month: 'Mar', sales: 2780 },
        { month: 'Apr', sales: 4890 },
        { month: 'May', sales: 3390 },
        { month: 'Jun', sales: 5100 }
      ],
      categoryBreakdown: [
        { name: 'Power Tools', value: 35 },
        { name: 'Hand Tools', value: 25 },
        { name: 'Plumbing', value: 15 },
        { name: 'Electrical', value: 15 },
        { name: 'Materials', value: 10 }
      ]
    }
  });
});

// Owner dashboard endpoint
router.get('/owner', (req, res) => {
  // Return owner dashboard data
  res.json({
    success: true,
    message: 'Owner dashboard data retrieved successfully',
    data: {
      // Add owner-specific data here
    }
  });
});

module.exports = router;