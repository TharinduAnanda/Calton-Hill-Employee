const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const marketingController = require('../controllers/marketingController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Dashboard data
router.get('/dashboard', requireRole(['owner', 'manager']), marketingController.getDashboardData);
router.get('/dashboard/marketing', requireRole(['owner', 'manager']), marketingController.getMarketingDashboard);

// Loyalty program routes
router.get('/loyalty/settings', requireRole(['owner', 'manager']), marketingController.getLoyaltySettings);
router.put('/loyalty/settings', requireRole(['owner']), marketingController.updateLoyaltySettings);
router.get('/loyalty/members', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyMembers);
router.get('/loyalty/rewards', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyRewards);
router.post('/loyalty/rewards', requireRole(['owner', 'manager']), marketingController.createLoyaltyReward);
router.put('/loyalty/rewards/:id', requireRole(['owner', 'manager']), marketingController.updateLoyaltyReward);
router.delete('/loyalty/rewards/:id', requireRole(['owner', 'manager']), marketingController.deleteLoyaltyReward);

// Loyalty tiers routes
router.get('/loyalty/tiers', requireRole(['owner', 'manager', 'staff']), marketingController.getLoyaltyTiers);
router.post('/loyalty/tiers', requireRole(['owner', 'manager']), marketingController.createLoyaltyTier);
router.put('/loyalty/tiers/:id', requireRole(['owner', 'manager']), marketingController.updateLoyaltyTier);
router.delete('/loyalty/tiers/:id', requireRole(['owner', 'manager']), marketingController.deleteLoyaltyTier);

// Email campaigns routes
router.get('/campaigns/email', requireRole(['owner', 'manager', 'staff']), marketingController.getEmailCampaigns);
router.get('/campaigns/email/:id', requireRole(['owner', 'manager', 'staff']), marketingController.getEmailCampaign);
router.post('/campaigns/email', requireRole(['owner', 'manager']), marketingController.createEmailCampaign);
router.post('/campaigns/email/:id/test', requireRole(['owner', 'manager']), marketingController.sendTestEmail);
router.post('/campaigns/email/:id/send', requireRole(['owner', 'manager']), marketingController.sendEmailCampaign);

// Promotions routes
router.get('/promotions', requireRole(['owner', 'manager', 'staff']), marketingController.getPromotions);
router.post('/promotions', requireRole(['owner', 'manager']), marketingController.createPromotion);
router.put('/promotions/:id', requireRole(['owner', 'manager']), marketingController.updatePromotion);
router.delete('/promotions/:id', requireRole(['owner', 'manager']), marketingController.deletePromotion);

module.exports = router;