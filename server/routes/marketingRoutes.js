const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const marketingController = require('../controllers/marketingController');
const { protect, requireRole } = require('../middleware/authMiddleware');


// Apply authentication middleware to all routes
router.use(protect);
// console.log('Available marketing controller functions:', Object.keys(marketingController));
// Middleware to ensure function exists before using it
const ensureFunction = (fn) => {
  return (req, res, next) => {
    if (typeof fn === 'function') {
      return fn(req, res, next);
    }
    console.error(`Route handler is not a function: ${typeof fn}`);
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  };
};

// Dashboard data
router.get('/dashboard', requireRole(['owner', 'manager']), marketingController.getDashboardData);

// Loyalty program routes
router.get('/loyalty/settings', requireRole(['owner', 'manager']), marketingController.getLoyaltySettings);
router.put('/loyalty/settings', requireRole(['owner', 'manager']), marketingController.updateLoyaltySettings);
router.get('/loyalty/members', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyMembers);
router.get('/loyalty/members/:memberId/history', requireRole(['owner', 'manager', 'staff']), marketingController.getMemberPointsHistory);
router.get('/loyalty/rewards', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyRewards);
router.post('/loyalty/rewards', requireRole(['owner', 'manager']), marketingController.createLoyaltyReward);
router.put('/loyalty/rewards/:id', requireRole(['owner', 'manager']), marketingController.updateLoyaltyReward);
router.delete('/loyalty/rewards/:id', requireRole(['owner', 'manager']), marketingController.deleteLoyaltyReward);
router.get('/loyalty/tiers', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyTiers);
router.post('/loyalty/tiers', requireRole(['owner', 'manager']), marketingController.createLoyaltyTier);
router.put('/loyalty/tiers/:id', requireRole(['owner', 'manager']), marketingController.updateLoyaltyTier);
router.delete('/loyalty/tiers/:id', requireRole(['owner', 'manager']), marketingController.deleteLoyaltyTier);

// Email campaigns routes
router.get('/campaigns', requireRole(['owner', 'manager', 'staff']), marketingController.getCampaigns);
router.post('/campaigns', requireRole(['owner', 'manager']), marketingController.createCampaign);
router.put('/campaigns/:id', requireRole(['owner', 'manager']), marketingController.updateCampaign);
// Campaign-specific operations
router.post('/campaigns/:id/schedule', requireRole(['owner', 'manager']), marketingController.scheduleCampaign);
router.post('/campaigns/:id/test', requireRole(['owner', 'manager']), marketingController.sendTestEmail);
router.post('/campaigns/:id/send-single', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.sendSingleEmailCampaign));
router.post('/campaigns/:id/send', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.sendEmailCampaign));
router.delete('/campaigns/:id', requireRole(['owner', 'manager']), marketingController.deleteCampaign);
router.get('/email-metrics', protect, marketingController.getEmailCampaignMetrics);
// Email campaign analytics route
router.get('/campaigns/:id/analytics', requireRole(['owner', 'manager', 'staff']), 
  marketingController.getCampaignAnalytics);

// Promotions routes - reorder them
router.post('/promotions/apply-automatic', requireRole(['owner', 'manager', 'staff']), 
  ensureFunction(marketingController.applyAutomaticPromotions));
router.get('/promotions', requireRole(['owner', 'manager', 'staff']), 
  ensureFunction(marketingController.getPromotions));
router.post('/promotions', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.createPromotion));
router.put('/promotions/:id', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.updatePromotion));
router.delete('/promotions/:id', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.deletePromotion));
router.put('/promotions/:id/toggle', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.togglePromotionStatus));

// Add this route to handle the toggle action

// Coupon routes - reorder them
router.post('/coupons/validate', requireRole(['owner', 'manager', 'staff']), 
  ensureFunction(marketingController.validateCoupon));
router.post('/coupons/apply', requireRole(['owner', 'manager', 'staff']), 
  ensureFunction(marketingController.applyCouponToOrder));
router.get('/coupons', requireRole(['owner', 'manager', 'staff']), 
  ensureFunction(marketingController.getCoupons));
router.post('/coupons', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.createCoupon));
router.put('/coupons/:id', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.updateCoupon));
router.delete('/coupons/:id', requireRole(['owner', 'manager']), 
  ensureFunction(marketingController.deleteCoupon));

// Customer segment routes
router.get('/segments', requireRole(['owner', 'manager', 'staff']), marketingController.getCustomerSegments);
router.post('/segments', requireRole(['owner', 'manager']), marketingController.createCustomerSegment);
router.put('/segments/:id', requireRole(['owner', 'manager']), marketingController.updateCustomerSegment);
router.delete('/segments/:id', requireRole(['owner', 'manager']), marketingController.deleteCustomerSegment);

module.exports = router;