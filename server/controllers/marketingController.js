const { executeQuery } = require('../config/db');
const { validationResult } = require('express-validator');

// Fallback method for mock data in case DB isn't working
const getMockLoyaltyData = () => {
  // Return mock data for development
  return {
    settings: {
      program_enabled: true,
      points_per_dollar: 1,
      min_points_redemption: 100,
      points_value_factor: 0.01,
      expiry_period_days: 365,
      welcome_bonus: 100,
      birthday_bonus: 50,
      referral_bonus: 50,
      vip_tiers_enabled: true
    },
    rewards: [
      {
        id: 1,
        name: '10% Discount',
        description: 'Get 10% off your next purchase',
        points_required: 200,
        reward_type: 'discount',
        reward_value: '10',
        active: true
      },
      {
        id: 2,
        name: '$5 Off',
        description: 'Get $5 off your next purchase',
        points_required: 500,
        reward_type: 'fixed',
        reward_value: '5',
        active: true
      }
    ],
    tiers: [
      {
        id: 1,
        name: 'Silver',
        points_threshold: 1000,
        benefits: 'Free shipping on all orders',
        multiplier: 1.2
      },
      {
        id: 2,
        name: 'Gold',
        points_threshold: 5000,
        benefits: 'Free shipping, priority customer service',
        multiplier: 1.5
      }
    ],
    members: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        points: 1500,
        joined_date: '2023-01-15',
        total_spent: 500.75
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        points: 750,
        joined_date: '2023-03-20',
        total_spent: 320.50
      }
    ]
  };
};

// ======== LOYALTY PROGRAM ========

/**
 * Get loyalty program settings
 */
exports.getLoyaltySettings = async (req, res) => {
  try {
    console.log('Getting loyalty settings');
    
    // Try to get settings from database first
    let settings = await executeQuery(
      'SELECT * FROM loyalty_settings WHERE store_id = ? LIMIT 1',
      [req.user?.storeId || 1] // Default to store ID 1 if not specified
    );
    
    // If no settings found, return default values
    if (!settings || settings.length === 0) {
      console.log('No loyalty settings found, returning defaults');
      return res.status(200).json(getMockLoyaltyData().settings);
    }
    
    console.log('Loyalty settings found:', settings[0]);
    res.status(200).json(settings[0]);
  } catch (error) {
    console.error('Error fetching loyalty settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve loyalty settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update loyalty program settings
 */
exports.updateLoyaltySettings = async (req, res) => {
  try {
    const {
      program_enabled,
      points_per_dollar,
      min_points_redemption,
      points_value_factor,
      expiry_period_days,
      welcome_bonus,
      birthday_bonus,
      referral_bonus,
      vip_tiers_enabled
    } = req.body;
    
    // Check if settings exist
    const settings = await executeQuery(
      'SELECT * FROM loyalty_settings WHERE store_id = ?',
      [req.user.storeId || 1]
    );
    
    if (settings.length === 0) {
      // Create new settings
      await executeQuery(
        `INSERT INTO loyalty_settings (
          store_id, 
          program_enabled, 
          points_per_dollar, 
          min_points_redemption, 
          points_value_factor, 
          expiry_period_days, 
          welcome_bonus, 
          birthday_bonus, 
          referral_bonus, 
          vip_tiers_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.storeId || 1,
          program_enabled,
          points_per_dollar,
          min_points_redemption,
          points_value_factor,
          expiry_period_days,
          welcome_bonus,
          birthday_bonus,
          referral_bonus,
          vip_tiers_enabled
        ]
      );
    } else {
      // Update existing settings
      await executeQuery(
        `UPDATE loyalty_settings SET
          program_enabled = ?,
          points_per_dollar = ?,
          min_points_redemption = ?,
          points_value_factor = ?,
          expiry_period_days = ?,
          welcome_bonus = ?,
          birthday_bonus = ?,
          referral_bonus = ?,
          vip_tiers_enabled = ?
        WHERE store_id = ?`,
        [
          program_enabled,
          points_per_dollar,
          min_points_redemption,
          points_value_factor,
          expiry_period_days,
          welcome_bonus,
          birthday_bonus,
          referral_bonus,
          vip_tiers_enabled,
          req.user.storeId || 1
        ]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Loyalty settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get loyalty rewards
 */
exports.getLoyaltyRewards = async (req, res) => {
  try {
    console.log('Getting loyalty rewards');
    
    let rewards = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE store_id = ? ORDER BY points_required ASC',
      [req.user?.storeId || 1]
    );
    
    if (!rewards || rewards.length === 0) {
      console.log('No rewards found, returning empty array');
      return res.status(200).json([]);
    }
    
    console.log(`Found ${rewards.length} rewards`);
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    // If database query fails, return mock data for development
    const mockData = getMockLoyaltyData().rewards;
    console.log('Returning mock reward data');
    res.status(200).json(mockData);
  }
};

/**
 * Create loyalty reward
 */
exports.createLoyaltyReward = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      name,
      description,
      points_required,
      reward_type,
      reward_value,
      active = true
    } = req.body;
    
    // Validate required fields
    if (!name || !points_required || !reward_type) {
      return res.status(400).json({
        success: false,
        message: 'Name, points required, and reward type are required'
      });
    }
    
    // Insert reward
    const result = await executeQuery(
      `INSERT INTO loyalty_rewards (
        store_id,
        name,
        description,
        points_required,
        reward_type,
        reward_value,
        active,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.storeId || 1,
        name,
        description || null,
        points_required,
        reward_type,
        reward_value,
        active ? 1 : 0
      ]
    );
    
    // Get the inserted reward
    const newReward = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Loyalty reward created successfully',
      data: newReward[0]
    });
  } catch (error) {
    console.error('Error creating loyalty reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loyalty reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update loyalty reward
 */
exports.updateLoyaltyReward = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      name,
      description,
      points_required,
      reward_type,
      reward_value,
      active
    } = req.body;
    
    // Check if reward exists
    const rewardCheck = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    if (rewardCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    // Update reward
    await executeQuery(
      `UPDATE loyalty_rewards SET
        name = ?,
        description = ?,
        points_required = ?,
        reward_type = ?,
        reward_value = ?,
        active = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [
        name,
        description || null,
        points_required,
        reward_type,
        reward_value,
        active ? 1 : 0,
        id,
        req.user.storeId || 1
      ]
    );
    
    // Get updated reward
    const updatedReward = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Loyalty reward updated successfully',
      data: updatedReward[0]
    });
  } catch (error) {
    console.error('Error updating loyalty reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete loyalty reward
 */
exports.deleteLoyaltyReward = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if reward exists
    const rewardCheck = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    if (rewardCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    // Delete reward
    await executeQuery(
      'DELETE FROM loyalty_rewards WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    res.status(200).json({
      success: true,
      message: 'Loyalty reward deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting loyalty reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loyalty reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get loyalty tiers
 */
exports.getLoyaltyTiers = async (req, res) => {
  try {
    console.log('Getting loyalty tiers');
    
    let tiers = await executeQuery(
      'SELECT * FROM loyalty_tiers WHERE store_id = ? ORDER BY points_threshold ASC',
      [req.user?.storeId || 1]
    );
    
    if (!tiers || tiers.length === 0) {
      console.log('No tiers found, returning empty array');
      return res.status(200).json([]);
    }
    
    console.log(`Found ${tiers.length} tiers`);
    res.status(200).json(tiers);
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    // If database query fails, return mock data for development
    const mockData = getMockLoyaltyData().tiers;
    console.log('Returning mock tier data');
    res.status(200).json(mockData);
  }
};

/**
 * Create loyalty tier
 */
exports.createLoyaltyTier = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      name,
      points_threshold,
      benefits,
      multiplier = 1
    } = req.body;
    
    // Validate required fields
    if (!name || !points_threshold) {
      return res.status(400).json({
        success: false,
        message: 'Name and points threshold are required'
      });
    }
    
    // Insert tier
    const result = await executeQuery(
      `INSERT INTO loyalty_tiers (
        store_id,
        name,
        points_threshold,
        benefits,
        multiplier,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        req.user.storeId || 1,
        name,
        points_threshold,
        benefits || null,
        multiplier
      ]
    );
    
    // Get the inserted tier
    const newTier = await executeQuery(
      'SELECT * FROM loyalty_tiers WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Loyalty tier created successfully',
      data: newTier[0]
    });
  } catch (error) {
    console.error('Error creating loyalty tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loyalty tier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update loyalty tier
 */
exports.updateLoyaltyTier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      name,
      points_threshold,
      benefits,
      multiplier
    } = req.body;
    
    // Check if tier exists
    const tierCheck = await executeQuery(
      'SELECT * FROM loyalty_tiers WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    if (tierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tier not found'
      });
    }
    
    // Update tier
    await executeQuery(
      `UPDATE loyalty_tiers SET
        name = ?,
        points_threshold = ?,
        benefits = ?,
        multiplier = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [
        name,
        points_threshold,
        benefits || null,
        multiplier,
        id,
        req.user.storeId || 1
      ]
    );
    
    // Get updated tier
    const updatedTier = await executeQuery(
      'SELECT * FROM loyalty_tiers WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Loyalty tier updated successfully',
      data: updatedTier[0]
    });
  } catch (error) {
    console.error('Error updating loyalty tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty tier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete loyalty tier
 */
exports.deleteLoyaltyTier = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tier exists
    const tierCheck = await executeQuery(
      'SELECT * FROM loyalty_tiers WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    if (tierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tier not found'
      });
    }
    
    // Delete tier
    await executeQuery(
      'DELETE FROM loyalty_tiers WHERE id = ? AND store_id = ?',
      [id, req.user.storeId || 1]
    );
    
    res.status(200).json({
      success: true,
      message: 'Loyalty tier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting loyalty tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loyalty tier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get loyalty members
 */
exports.getLoyaltyMembers = async (req, res) => {
  try {
    console.log('Getting loyalty members');
    
    // In a real application, you would query your customers table
    // For now, we'll return mock data
    const mockData = getMockLoyaltyData().members;
    console.log('Returning mock member data');
    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve loyalty members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get marketing dashboard data
 */
exports.getMarketingDashboard = async (req, res) => {
  try {
    console.log('Getting marketing dashboard data');
    
    const mockData = {
      loyalty: {
        totalMembers: 125,
        activeRewards: 3,
        pointsIssued: 15000,
        pointsRedeemed: 5500
      },
      campaigns: {
        active: 2,
        scheduled: 3,
        completed: 5,
        totalSent: 2500
      },
      recentActivity: [
        {
          id: 1,
          type: 'loyalty',
          action: 'earn 500 points',
          date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'campaign',
          action: 'Campaign "Summer Sale" active',
          date: new Date().toISOString()
        }
      ]
    };
    
    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error fetching marketing dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve marketing dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};