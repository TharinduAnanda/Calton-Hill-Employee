const { executeQuery } = require('../config/db');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// Add this utility function at the top of the file after the imports
const logQuery = (operation, query, params) => {
  console.log(`[DB OPERATION] ${operation}`);
  console.log(`[SQL] ${query.substring(0, 300)}${query.length > 300 ? '...' : ''}`);
  console.log(`[PARAMS]`, params);
};

// Add this helper function to log results
const logResult = (operation, result) => {
  console.log(`[DB RESULT] ${operation} completed`);
  
  if (Array.isArray(result)) {
    console.log(`[DB RESULT] Found ${result.length} records`);
    if (result.length > 0) {
      console.log(`[DB RESULT] First record:`, JSON.stringify(result[0]).substring(0, 200) + '...');
    }
  } else if (result && typeof result === 'object') {
    console.log(`[DB RESULT]`, JSON.stringify(result).substring(0, 200) + '...');
  }
};

// Create a wrapped version instead of trying to reassign the constant
const executeQueryWithLogging = async (query, params = []) => {
  const operation = query.substring(0, 30).replace(/\s+/g, ' ').trim() + '...';
  console.log(`[DB OPERATION START] ${operation}`);
  console.log(`[SQL] ${query.substring(0, 300)}${query.length > 300 ? '...' : ''}`);
  console.log(`[PARAMS]`, params);
  
  try {
    const result = await executeQuery(query, params);
    console.log(`[DB OPERATION SUCCESS] ${operation}`);
    if (Array.isArray(result)) {
      console.log(`[DB RESULT] Found ${result.length} records`);
      if (result.length > 0 && result.length < 5) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DB RESULT] Records:`, JSON.stringify(result).substring(0, 300) + '...');
        }
      } else if (result.length > 0) {
        console.log(`[DB RESULT] First record:`, JSON.stringify(result[0]).substring(0, 200) + '...');
      }
    } else {
      console.log(`[DB RESULT]`, JSON.stringify(result).substring(0, 200) + '...');
    }
    return result;
  } catch (error) {
    console.error(`[DB OPERATION ERROR] ${operation}:`, error);
    console.error(`[SQL ERROR] ${error.sqlMessage || 'No SQL message'}`);
    console.error(`[SQL ERROR CODE] ${error.code || 'No error code'}`);
    console.error(`[SQL ERROR STACK] ${error.stack}`);
    throw error;
  }
};

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
    let settings = await executeQueryWithLogging(
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
    const settings = await executeQueryWithLogging(
      'SELECT * FROM loyalty_settings WHERE store_id = ?',
      [req.user.storeId || 1]
    );
    
    if (settings.length === 0) {
      // Create new settings
      await executeQueryWithLogging(
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
      await executeQueryWithLogging(
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
    
    let rewards = await executeQueryWithLogging(
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
    const result = await executeQueryWithLogging(
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
    const newReward = await executeQueryWithLogging(
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
 * @route PUT /api/marketing/loyalty/rewards/:id
 */
exports.updateLoyaltyReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, points_required, discount_type, discount_value, expiry_days, active } = req.body;
    
    // Validation
    if (!name || !description || !points_required || !discount_type || !discount_value) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Database query
    const query = `
      UPDATE loyalty_rewards
      SET 
        name = ?,
        description = ?,
        points_required = ?,
        discount_type = ?,
        discount_value = ?,
        expiry_days = ?,
        active = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [
      name,
      description,
      points_required,
      discount_type,
      discount_value,
      expiry_days || null,
      active !== undefined ? active : true, // Default to active if not specified
      id
    ];
    
    await executeQueryWithLogging(query, params);
    
    // Get updated reward data
    const selectQuery = `SELECT * FROM loyalty_rewards WHERE id = ?`;
    const updatedReward = await executeQueryWithLogging(selectQuery, [id]);
    
    if (!updatedReward || updatedReward.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty reward not found after update'
      });
    }
    
    res.status(200).json({
      success: true,
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
    const rewardCheck = await executeQueryWithLogging(
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
    await executeQueryWithLogging(
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
    
    let tiers = await executeQueryWithLogging(
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
    const result = await executeQueryWithLogging(
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
    const newTier = await executeQueryWithLogging(
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
    const tierCheck = await executeQueryWithLogging(
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
    await executeQueryWithLogging(
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
    const updatedTier = await executeQueryWithLogging(
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
    const tierCheck = await executeQueryWithLogging(
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
    await executeQueryWithLogging(
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
 * Get loyalty members from database - FIXED VERSION WITH CORRECT COLUMN NAMES
 */
exports.getLoyaltyMembers = async (req, res) => {
  try {
    console.log('🏆 Getting loyalty members from database ONLY - no mock data');
    
    // Use correct column names with uppercase to match database schema
    const query = `
      SELECT 
        c.ID as id,
        c.NAME as name,
        c.EMAIL as email,
        COALESCE(c.loyalty_points, 0) as points,
        c.customer_since as joined_date,
        COALESCE(c.total_spent, 0) as total_spent,
        c.last_points_update,
        COALESCE(c.redeemed_points, 0) as redeemed_points
      FROM 
        customer c
      ORDER BY 
        c.loyalty_points DESC
    `;
    
    // Execute query without store ID parameter
    const members = await executeQueryWithLogging(query);
    
    console.log(`📊 Database query returned ${members ? members.length : 0} members`);
    console.log(`📊 Sample data: ${members && members.length > 0 ? JSON.stringify(members[0]) : 'No members'}`);
    
    // Always return what we got from the database, even if empty
    const formattedMembers = members && members.length > 0 
      ? members.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          points: parseInt(member.points || 0),
          joined_date: member.joined_date,
          total_spent: parseFloat(member.total_spent || 0),
          last_points_update: member.last_points_update,
          redeemed_points: parseInt(member.redeemed_points || 0),
        }))
      : [];
    
    console.log(`✅ Returning ${formattedMembers.length} members from database`);
    
    // Send response with only database results
    return res.status(200).json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error('❌ Error fetching loyalty members from database:', error);
    console.error('🔧 SQL Error details:', error.sqlMessage || 'No SQL message');
    
    // Return empty array instead of mock data on error
    return res.status(200).json({
      success: true,
      data: []
    });
  }
};

/**
 * Get member points history from database
 * @route GET /api/marketing/loyalty/members/:memberId/history
 */
exports.getMemberPointsHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }
    
    console.log(`Getting points history for member ID: ${memberId}`);
    
    // Query to get point transactions for a specific member - using correct table name
    const query = `
      SELECT 
        t.id,
        t.transaction_type,
        t.points,
        t.source,
        t.description,
        t.created_at as date
      FROM 
        loyalty_points_transactions t
      WHERE 
        t.customer_id = ?
      ORDER BY 
        t.created_at DESC
      LIMIT 50
    `;
    
    // Execute query with member ID parameter
    const transactions = await executeQueryWithLogging(query, [memberId]);
    
    console.log(`Found ${transactions.length} transactions for member ID: ${memberId}`);
    
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching loyalty member points history:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve loyalty member points history',
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

/**
 * Get dashboard data
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Get loyalty summary
    const loyaltyStats = await executeQueryWithLogging(`
      SELECT 
        COUNT(DISTINCT ID) as totalMembers,
        COALESCE(SUM(loyalty_points), 0) as totalPoints,
        (SELECT COUNT(*) FROM loyalty_rewards WHERE active = 1) as activeRewards
      FROM customer 
      WHERE loyalty_points > 0
    `);
    
    // Get point transactions
    const pointTransactions = await executeQueryWithLogging(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'earn' THEN points ELSE 0 END), 0) as pointsIssued,
        COALESCE(SUM(CASE WHEN transaction_type = 'redeem' THEN points ELSE 0 END), 0) as pointsRedeemed
      FROM loyalty_points_transactions
    `);
    
    // Get campaign stats
    const campaignStats = await executeQueryWithLogging(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END), 0) as draft,
        COALESCE(SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END), 0) as scheduled,
        COALESCE(SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END), 0) as completed,
        COUNT(*) as total
      FROM email_campaigns
    `);
    
    // Get recent activity
    const recentActivity = await executeQueryWithLogging(`
      (SELECT 
        c.ID as id,
        'loyalty' as type,
        CONCAT(c.NAME, ' - Points: ', c.loyalty_points) as action,
        c.updatedAt as date
      FROM customer c
      WHERE c.loyalty_points > 0
      ORDER BY c.updatedAt DESC
      LIMIT 5)
      UNION
      (SELECT 
        e.id as id,
        'campaign' as type,
        CONCAT('Email: ', e.name, ' - ', e.status) as action,
        e.updated_at as date
      FROM email_campaigns e
      ORDER BY e.updated_at DESC
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `);
    
    // Return structured data
    res.status(200).json({
      success: true,
      data: {
        loyalty: {
          totalMembers: parseInt(loyaltyStats[0]?.totalMembers || 0),
          activeRewards: parseInt(loyaltyStats[0]?.activeRewards || 0),
          pointsIssued: parseInt(pointTransactions[0]?.pointsIssued || 0),
          pointsRedeemed: parseInt(pointTransactions[0]?.pointsRedeemed || 0)
        },
        campaigns: {
          draft: parseInt(campaignStats[0]?.draft || 0),
          scheduled: parseInt(campaignStats[0]?.scheduled || 0),
          completed: parseInt(campaignStats[0]?.completed || 0),
          total: parseInt(campaignStats[0]?.total || 0)
        },
        recentActivity: recentActivity.map(item => ({
          id: item.id,
          type: item.type,
          action: item.action,
          date: item.date
        })) || []
      }
    });
  } catch (error) {
    console.error('Error fetching marketing dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketing dashboard data',
      error: error.message
    });
  }
};

/**
 * Get email campaign metrics summary
 */
exports.getEmailCampaignMetrics = async (req, res) => {
  try {
    console.log('Getting email campaign metrics summary');
    
    // Get total emails sent from email_campaign_logs
    const emailCountQuery = await executeQueryWithLogging(`
      SELECT 
        COUNT(*) as total_sent,
        SUM(opened) as total_opened,
        SUM(clicked) as total_clicked,
        SUM(bounced) as total_bounced
      FROM email_campaign_logs
      WHERE sent = 1
    `);
    
    // Get conversion data from orders (without source filter since it doesn't exist)
    const conversionQuery = await executeQueryWithLogging(`
      SELECT 
        COUNT(*) as conversion_count,
        SUM(Total_Amount) as revenue_generated
      FROM customerorder
      WHERE Order_Date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Parse metrics with default values if null
    const totalSent = parseInt(emailCountQuery[0]?.total_sent || 0);
    const totalOpened = parseInt(emailCountQuery[0]?.total_opened || 0);
    const totalClicked = parseInt(emailCountQuery[0]?.total_clicked || 0);
    const totalBounced = parseInt(emailCountQuery[0]?.total_bounced || 0);
    const conversionCount = parseInt(conversionQuery[0]?.conversion_count || 0);
    const revenueGenerated = parseFloat(conversionQuery[0]?.revenue_generated || 0);
    
    // Calculate rates with protection against division by zero
    const deliveryRate = totalSent > 0 ? ((totalSent - totalBounced) / totalSent) * 100 : 0;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    const conversionRate = totalClicked > 0 ? (conversionCount / totalClicked) * 100 : 0;
    
    // Send real data without fallback to mock data
    res.status(200).json({
      success: true,
      data: {
        totalSent,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenue: revenueGenerated
      },
      hasData: totalSent > 0
    });
  } catch (error) {
    console.error('Error getting email metrics:', error);
    
    // Return empty data in case of error - without any mock values
    res.status(200).json({
      success: true,
      data: {
        totalSent: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        deliveryRate: 0,
        conversionRate: 0,
        revenue: 0
      },
      hasData: false
    });
  }
};

/**
 * Get promotions - Get only automatic promotions (not coupons)
 */
exports.getPromotions = async (req, res) => {
  try {
    console.log('Server: getPromotions called - automatic promotions only');
    
    // Query specifically for automatic promotions
    let query = 'SELECT * FROM promotions WHERE store_id = ? AND promotion_type = ?';
    let params = [req.user?.storeId || 1, 'automatic'];
    
    query += ' ORDER BY created_at DESC';
    
    let promotions = await executeQueryWithLogging(query, params);
    
    console.log('Database query result:', promotions);
    
    if (!promotions || promotions.length === 0) {
      console.log('No automatic promotions found, returning empty array');
      return res.status(200).json({ success: true, data: [] });
    }
    
    console.log(`Found ${promotions.length} automatic promotions`);
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

/**
 * Get coupons - Get only coupon-type promotions
 */
exports.getCoupons = async (req, res) => {
  try {
    console.log('Server: getCoupons called');
    
    // Query specifically for coupon promotions
    let query = 'SELECT * FROM promotions WHERE store_id = ? AND promotion_type = ?';
    let params = [req.user?.storeId || 1, 'coupon'];
    
    query += ' ORDER BY created_at DESC';
    
    let coupons = await executeQueryWithLogging(query, params);
    
    console.log('Database query result:', coupons);
    
    if (!coupons || coupons.length === 0) {
      console.log('No coupons found, returning empty array');
      return res.status(200).json({ success: true, data: [] });
    }
    
    // Transform database records to client-expected format
    const transformedCoupons = coupons.map(coupon => ({
      ...coupon,
      discount_type: coupon.type,
      discount_value: coupon.value,
      usage_limit: coupon.max_uses
    }));
    
    console.log(`Found ${coupons.length} coupons`);
    res.status(200).json({ success: true, data: transformedCoupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(200).json({ success: true, data: [] });
  }
};

/**
 * Create a coupon
 */
exports.createCoupon = async (req, res) => {
  try {
    console.log('Server: createCoupon called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      code,
      type,
      value,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      max_uses,
      description,
      is_active,
      applies_to,
      category_ids,
      product_ids,
      distribution_channel,
      one_time_use
    } = req.body;
    
    console.log('Processing coupon data for insert');
    
    // Insert into promotions table (both promotions and coupons use the same table)
    const result = await executeQueryWithLogging(
      `INSERT INTO promotions (
        store_id,
        name,
        code,
        type,
        value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        max_uses,
        description,
        is_active,
        applies_to,
        category_ids,
        product_ids,
        distribution_channel,
        one_time_use,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user?.storeId || 1,
        name || code,
        code,
        type,
        value,
        min_purchase || 0,
        max_discount || null,
        start_date,
        end_date,
        max_uses || null,
        description || null,
        is_active ? 1 : 0,
        applies_to || 'entire_order',
        JSON.stringify(category_ids || []),
        JSON.stringify(product_ids || []),
        distribution_channel || 'online',
        one_time_use ? 1 : 0
      ]
    );
    
    if (!result || !result.insertId) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create coupon - database error'
      });
    }
    
    // Get the inserted coupon
    const newCoupon = await executeQueryWithLogging(
      'SELECT * FROM promotions WHERE id = ?',
      [result.insertId]
    );
    
    if (!newCoupon || newCoupon.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon was created but could not be retrieved'
      });
    }
    
    // Transform the coupon to client-expected format
    const transformedCoupon = {
      ...newCoupon[0],
      discount_type: newCoupon[0].type,
      discount_value: newCoupon[0].value,
      usage_limit: newCoupon[0].max_uses
    };
    
    res.status(201).json(transformedCoupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate a coupon
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_id } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }
    
    console.log(`Validating coupon code: ${code}`);
    
    // Query for the coupon
    const coupon = await executeQueryWithLogging(
      `SELECT * FROM promotions 
       WHERE code = ? 
       AND promotion_type = 'coupon'
       AND is_active = 1
       AND start_date <= NOW() 
       AND (end_date IS NULL OR end_date >= NOW())`,
      [code]
    );
    
    if (!coupon || coupon.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          valid: false,
          message: 'Invalid coupon code'
        }
      });
    }
    
    // Check if the coupon has reached its usage limit
    if (coupon[0].max_uses) {
      const usageCount = await executeQueryWithLogging(
        'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?',
        [coupon[0].id]
      );
      
      if (usageCount && usageCount[0].count >= coupon[0].max_uses) {
        return res.status(200).json({
          success: true,
          data: {
            valid: false,
            message: 'Coupon usage limit exceeded'
          }
        });
      }
    }
    
    // Transform to client-expected format
    const couponData = {
      ...coupon[0],
      discount_type: coupon[0].type,
      discount_value: coupon[0].value,
      valid: true
    };
    
    res.status(200).json({
      success: true,
      data: couponData
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update coupon
 */
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = { ...req.body };
    
    console.log('Raw coupon update data:', formData);
    
    // Format dates correctly for MySQL
    if (formData.start_date) {
      formData.start_date = typeof formData.start_date === 'string' 
        ? formData.start_date.replace('T', ' ').substring(0, 19)
        : new Date(formData.start_date).toISOString().replace('T', ' ').substring(0, 19);
    }
    
    if (formData.end_date) {
      formData.end_date = typeof formData.end_date === 'string' 
        ? formData.end_date.replace('T', ' ').substring(0, 19)
        : new Date(formData.end_date).toISOString().replace('T', ' ').substring(0, 19);
    }
    
    // Handle arrays that need to be JSON strings in the database
    if (formData.category_ids) {
      formData.category_ids = typeof formData.category_ids === 'string'
        ? formData.category_ids
        : JSON.stringify(formData.category_ids);
    }
    
    if (formData.product_ids) {
      formData.product_ids = typeof formData.product_ids === 'string'
        ? formData.product_ids
        : JSON.stringify(formData.product_ids);
    }
    
    // Convert boolean to 0/1
    formData.is_active = formData.is_active ? 1 : 0;
    
    console.log('Processed coupon data:', formData);
    
    // Update coupon in database - note that coupons are stored in the promotions table
    const result = await executeQueryWithLogging(
      `UPDATE promotions SET
        name = ?,
        code = ?,
        type = ?,
        value = ?,
        min_purchase = ?,
        max_discount = ?,
        start_date = ?,
        end_date = ?,
        max_uses = ?,
        description = ?,
        is_active = ?,
        applies_to = ?,
        category_ids = ?,
        product_ids = ?,
        distribution_channel = ?,
        one_time_use = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [
        formData.name || formData.code,
        formData.code,
        formData.discount_type || formData.type,
        formData.discount_value || formData.value,
        formData.min_purchase || 0,
        formData.max_discount || null,
        formData.start_date,
        formData.end_date,
        formData.usage_limit || formData.max_uses || null,
        formData.description || null,
        formData.is_active,
        formData.applies_to || 'entire_order',
        formData.category_ids || '[]',
        formData.product_ids || '[]',
        formData.distribution_channel || 'online',
        formData.one_time_use ? 1 : 0,
        id,
        req.user?.storeId || 1
      ]
    );
    
    console.log('Coupon update result:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found or you do not have permission to update it'
      });
    }
    
    // Get the updated coupon
    const updatedCoupon = await executeQueryWithLogging(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    );
    
    if (!updatedCoupon || updatedCoupon.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Updated coupon could not be retrieved'
      });
    }
    
    // Transform the coupon to client-expected format
    const transformedCoupon = {
      ...updatedCoupon[0],
      discount_type: updatedCoupon[0].type,
      discount_value: updatedCoupon[0].value,
      usage_limit: updatedCoupon[0].max_uses
    };
    
    res.status(200).json({
      success: true,
      data: transformedCoupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete coupon
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Server: deleteCoupon called for ID:', id);
    
    // Delete coupon from database
    const result = await executeQueryWithLogging(
      'DELETE FROM promotions WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found or already deleted'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get customer segments
 */
exports.getCustomerSegments = async (req, res) => {
  try {
    console.log('Getting customer segments');
    
    let segments = await executeQueryWithLogging(
      'SELECT * FROM customer_segment ORDER BY segment_name ASC'
    );
    
    if (!segments || segments.length === 0) {
      console.log('No customer segments found, returning empty array');
      return res.status(200).json({ data: [] });
    }
    
    // Parse the criteria JSON if it exists
    segments = segments.map(segment => ({
      ...segment,
      segment_criteria: segment.segment_criteria ? JSON.parse(segment.segment_criteria) : {}
    }));
    
    console.log(`Found ${segments.length} customer segments`);
    res.status(200).json({ data: segments });
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(200).json({ data: [] });
  }
};

/**
 * Create customer segment
 */
exports.createCustomerSegment = async (req, res) => {
  try {
    const { segment_name, segment_description, segment_criteria } = req.body;
    
    // Insert into customer_segment table
    const result = await executeQueryWithLogging(
      `INSERT INTO customer_segment (
        segment_name,
        segment_description,
        segment_criteria,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, NOW(), NOW())`,
      [
        segment_name,
        segment_description || null,
        JSON.stringify(segment_criteria || {})
      ]
    );
    
    // Get the inserted segment
    const newSegment = await executeQueryWithLogging(
      'SELECT * FROM customer_segment WHERE segment_id = ?',
      [result.insertId]
    );
    
    // Parse the criteria JSON
    const responseSegment = {
      ...newSegment[0],
      segment_criteria: newSegment[0].segment_criteria ? JSON.parse(newSegment[0].segment_criteria) : {}
    };
    
    res.status(201).json(responseSegment);
  } catch (error) {
    console.error('Error creating customer segment:', error);
    res.status(500).json({
      message: 'Failed to create customer segment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update customer segment
 */
exports.updateCustomerSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { segment_name, segment_description, segment_criteria } = req.body;
    
    // Update segment in the database
    await executeQueryWithLogging(
      `UPDATE customer_segment SET
        segment_name = ?,
        segment_description = ?,
        segment_criteria = ?,
        updated_at = NOW()
      WHERE segment_id = ?`,
      [
        segment_name,
        segment_description || null,
        JSON.stringify(segment_criteria || {}),
        id
      ]
    );
    
    // Get updated segment
    const updatedSegment = await executeQueryWithLogging(
      'SELECT * FROM customer_segment WHERE segment_id = ?',
      [id]
    );
    
    if (!updatedSegment || updatedSegment.length === 0) {
      return res.status(404).json({
        message: 'Segment not found'
      });
    }
    
    // Parse the criteria JSON
    const responseSegment = {
      ...updatedSegment[0],
      segment_criteria: updatedSegment[0].segment_criteria ? JSON.parse(updatedSegment[0].segment_criteria) : {}
    };
    
    res.status(200).json(responseSegment);
  } catch (error) {
    console.error('Error updating customer segment:', error);
    res.status(500).json({
      message: 'Failed to update customer segment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete customer segment
 */
exports.deleteCustomerSegment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete segment from the database
    const result = await executeQueryWithLogging(
      'DELETE FROM customer_segment WHERE segment_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Segment not found or already deleted'
      });
    }
    
    res.status(200).json({
      message: 'Customer segment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer segment:', error);
    res.status(500).json({
      message: 'Failed to delete customer segment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new campaign
 */
exports.createCampaign = async (req, res) => {
  try {
    console.log('Creating new campaign');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      subject,
      content,
      from_name = 'Hardware Store',
      from_email = 'marketing@hardwarestore.com',
      template_id = null,
      segment_id = null,
      status = 'DRAFT',
      schedule_date = null,
      type = 'email'
    } = req.body;
    
    // Insert into database with correct column names matching your table structure
    const result = await executeQueryWithLogging(
      `INSERT INTO email_campaigns (
        store_id,
        name,
        subject,
        content,
        from_name,
        from_email,
        segment_id,
        template_id,
        status,
        schedule_date,
        type,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        req.user?.storeId || 1,
        name,
        subject,
        content,
        from_name,
        from_email,
        segment_id,
        template_id,
        status,
        schedule_date,
        type
      ]
    );
    
    if (!result || !result.insertId) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create campaign - database error'
      });
    }
    
    // Get the inserted campaign
    const newCampaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [result.insertId]
    );
    
    // Return the newly created campaign
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign[0]
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all campaigns
 */
exports.getCampaigns = async (req, res) => {
  try {
    console.log('Server: getCampaigns called');
    
    // FIXED: Changed the table name from "campaigns" to "email_campaigns"
    const campaigns = await executeQueryWithLogging(
      `SELECT * FROM email_campaigns WHERE store_id = ? ORDER BY created_at DESC`,
      [req.user?.storeId || 1]
    );
    
    // If no campaigns are found, return empty array
    if (!campaigns || campaigns.length === 0) {
      console.log('No email campaigns found, returning empty array');
      return res.status(200).json({ 
        success: true, 
        data: [] 
      });
    }
    
    console.log(`Found ${campaigns.length} campaigns`);
    return res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    
    // In case of error, return an empty array instead of error
    return res.status(200).json({ 
      success: true, 
      data: [] 
    });
  }
};

/**
 * Update a campaign
 */
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating campaign:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      subject,
      content,
      segment_id,
      status,
      schedule_date
    } = req.body;
    
    // Update campaign in database - using schedule_date to match DB column
    const result = await executeQueryWithLogging(
      `UPDATE email_campaigns SET
        name = ?,
        subject = ?,
        content = ?,
        segment_id = ?,
        status = ?,
        schedule_date = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [
        name,
        subject,
        content,
        segment_id || null,
        status,
        schedule_date,
        id,
        req.user?.storeId || 1
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to update it'
      });
    }
    
    // Get the updated campaign
    const updatedCampaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!updatedCampaign || updatedCampaign.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Updated campaign could not be retrieved'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: updatedCampaign[0]
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Schedule a campaign
 */
exports.scheduleCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_date } = req.body;
    
    if (!schedule_date) {
      return res.status(400).json({
        success: false,
        message: 'Schedule date is required'
      });
    }
    
    // Update campaign status and schedule_date (not scheduled_date)
    const result = await executeQueryWithLogging(
      `UPDATE email_campaigns SET 
        status = 'scheduled',
        schedule_date = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [schedule_date, id, req.user?.storeId || 1]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to schedule it'
      });
    }
    
    // Get the scheduled campaign
    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Campaign scheduled successfully',
      data: campaign[0]
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a campaign
 */
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting campaign:', id);
    
    // Delete the campaign from database
    const result = await executeQueryWithLogging(
      'DELETE FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or already deleted'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Apply coupon to order
 */
exports.applyCouponToOrder = async (req, res) => {
  try {
    const { code, order_id } = req.body;
    
    if (!code || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order ID are required'
      });
    }
    
    // Check if coupon exists and is valid
    const coupon = await executeQueryWithLogging(
      `SELECT * FROM promotions 
       WHERE code = ? 
       AND store_id = ? 
       AND is_active = 1
       AND is_active = 1
       AND start_date <= NOW() 
       AND end_date >= NOW()`,
      [code, req.user?.storeId || 1]
    );
    
    if (!coupon || coupon.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }
    
    // Check if order exists
    const order = await executeQuery(
      'SELECT * FROM orders WHERE id = ?',
      [order_id]
    );
    
    if (!order || order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const orderAmount = parseFloat(order[0].total_amount);
    const minPurchase = parseFloat(coupon[0].min_purchase);
    
    // Check minimum purchase requirement
    if (orderAmount < minPurchase) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum purchase of $${minPurchase.toFixed(2)}`
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon[0].type === 'percentage') {
      discountAmount = orderAmount * (parseFloat(coupon[0].value) / 100);
      
      // Check if there's a maximum discount cap
      if (coupon[0].max_discount && discountAmount > parseFloat(coupon[0].max_discount)) {
        discountAmount = parseFloat(coupon[0].max_discount);
      }
    } else {
      discountAmount = parseFloat(coupon[0].value);
      
      // Ensure discount doesn't exceed order total
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    }
    
    // Apply discount to order
    await executeQuery(
      `UPDATE orders SET
        coupon_code = ?,
        discount_amount = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [code, discountAmount, order_id]
    );
    
    // Record coupon usage
    await executeQuery(
      `INSERT INTO coupon_usage (
        promotion_id,
        order_id,
        discount_amount,
        used_at
      ) VALUES (?, ?, ?, NOW())`,
      [coupon[0].id, order_id, discountAmount]
    );
    
    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        discount_amount: discountAmount,
        order_total: parseFloat(orderAmount) - discountAmount,
        coupon_code: code
      }
    });
  } catch (error) {
    console.error('Error applying coupon to order:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon to order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Apply automatic promotions to cart/products
 */
exports.applyAutomaticPromotions = async (req, res) => {
  try {
    console.log('Applying automatic promotions');
    const { cart_items, cart_total } = req.body;
    
    if (!cart_items || !Array.isArray(cart_items)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required as an array'
      });
    }
    
    // Get all active automatic promotions
    const promotions = await executeQueryWithLogging(
      `SELECT * FROM promotions 
       WHERE store_id = ? 
       AND promotion_type = 'automatic'
       AND is_active = 1
       AND start_date <= NOW() 
       AND end_date >= NOW()`,
      [req.user?.storeId || 1]
    );
    
    if (!promotions || promotions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          applied_promotions: [],
          discounted_items: cart_items,
          original_total: cart_total,
          discounted_total: cart_total,
          total_discount: 0
        }
      });
    }
    
    let appliedPromotions = [];
    let totalDiscount = 0;
    let discountedItems = [...cart_items];
    
    // Process each promotion
    for (const promotion of promotions) {
      let promotionApplied = false;
      let promotionDiscount = 0;
      
      // Handle different promotion trigger types
      switch (promotion.trigger_type) {
        case 'cart_value':
          // Apply if cart meets minimum value
          if (cart_total >= parseFloat(promotion.min_purchase)) {
            // Calculate discount based on type
            if (promotion.type === 'percentage') {
              promotionDiscount = cart_total * (parseFloat(promotion.value) / 100);
              
              // Apply max discount cap if specified
              if (promotion.max_discount && promotionDiscount > parseFloat(promotion.max_discount)) {
                promotionDiscount = parseFloat(promotion.max_discount);
              }
            } else if (promotion.type === 'fixed_amount') {
              promotionDiscount = parseFloat(promotion.value);
            } else if (promotion.type === 'free_shipping') {
              promotionDiscount = 0; // Handled separately in order processing
              promotionApplied = true;
            }
            
            if (promotionDiscount > 0 || promotionApplied) {
              appliedPromotions.push({
                id: promotion.id,
                name: promotion.name,
                discount_amount: promotionDiscount,
                type: promotion.type
              });
              totalDiscount += promotionDiscount;
              promotionApplied = true;
            }
          }
          break;
          
        case 'product_quantity':
          // For "buy X get Y free" type promotions
          if (promotion.type === 'buy_x_get_y') {
            // This would require more detailed logic based on your specific requirements
            // Example implementation for product-specific deals
          }
          break;
          
        case 'category_purchase':
          // Apply promotion to specific categories
          if (promotion.applies_to === 'categories') {
            const categoryIds = JSON.parse(promotion.category_ids || '[]');
            if (categoryIds.length > 0) {
              // Apply discount to items in these categories
              // This would require cart_items to include category information
            }
          }
          break;
          
        case 'first_purchase':
          // Logic for first-time purchase promotions
          // This would require checking user's order history
          break;
      }
    }
    
    // Calculate final discounted total
    const discountedTotal = Math.max(0, cart_total - totalDiscount);
    
    return res.status(200).json({
      success: true,
      data: {
        applied_promotions: appliedPromotions,
        discounted_items: discountedItems,
        original_total: cart_total,
        discounted_total: discountedTotal,
        total_discount: totalDiscount
      }
    });
  } catch (error) {
    console.error('Error applying automatic promotions:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to apply automatic promotions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send test email for a campaign
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; // Make sure this matches what your frontend sends
    
    console.log(`Sending test email for campaign ${id} to ${email}`);
    
    // Get the campaign details
    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!campaign || campaign.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Send test email
    const result = await emailService.sendTestCampaignEmail(campaign[0], email);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
    
    // Log test email in the database
    await executeQueryWithLogging(
      `INSERT INTO email_campaign_logs (
        campaign_id, recipient, subject, sent, sent_at, is_test
      ) VALUES (?, ?, ?, 1, NOW(), 1)`,
      [id, email, campaign[0].subject]
    );
    
    res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`,
      data: {
        messageId: result.messageId
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send email campaign
 */
exports.sendEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Sending email campaign ${id} to recipients`);
    
    // Get the campaign details
    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!campaign || campaign.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Get recipients based on segment or all customers - Fix the SQL query here
    let recipients = [];
    
    if (campaign[0].segment_id) {
      // Fixed SQL query to properly join tables with correct column names
      recipients = await executeQueryWithLogging(
        `SELECT c.ID as id, c.EMAIL as email, c.NAME as first_name, c.NAME as last_name 
         FROM customer c
         JOIN customer_segment_members csm ON c.ID = csm.customer_id
         WHERE csm.segment_id = ? AND c.EMAIL IS NOT NULL`,
        [campaign[0].segment_id]
      );
    } else {
      // Using correct column names from your database schema
      recipients = await executeQueryWithLogging(
        'SELECT ID as id, EMAIL as email, NAME as first_name, NAME as last_name FROM customer WHERE EMAIL IS NOT NULL'
      );
    }
    
    console.log('Recipient query results:', recipients);

    if (recipients.length > 0) {
      console.log('Sample recipient:', recipients[0]);
    }

    // Also check if emails are properly populated
    const validEmails = recipients.filter(r => r.email && r.email.includes('@'));
    console.log(`Found ${validEmails.length} valid email addresses out of ${recipients.length} recipients`);

    // Skip any recipients without valid emails but continue with valid ones
    if (validEmails.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No valid email addresses found for this campaign'
      });
    } else {
      // Continue with only valid emails
      recipients = validEmails;
    }
    
    console.log(`Found ${recipients.length} recipients for campaign`);
    
    if (recipients.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No recipients found for this campaign'
      });
    }
    
    // Create batch record for tracking
    const batchRecord = await executeQueryWithLogging(
      `INSERT INTO email_campaign_batches (campaign_id, total_recipients, status, created_at)
       VALUES (?, ?, 'processing', NOW())`,
      [id, recipients.length]
    );
    
    const batchId = batchRecord.insertId;
    
    // Send the emails in batches
    const sendResult = await emailService.sendCampaignEmails(campaign[0], recipients);
    
    // Log the results in the database
    await executeQueryWithLogging(
      `UPDATE email_campaign_batches SET
         status = ?, 
         success_count = ?, 
         fail_count = ?,
         completed_at = NOW()
       WHERE id = ?`,
      [sendResult.success ? 'completed' : 'failed', sendResult.successCount, sendResult.errorCount, batchId]
    );
    
    // Update campaign status
    await executeQueryWithLogging(
      `UPDATE email_campaigns SET
         status = ?, 
         sent_at = NOW(),
         updated_at = NOW()
       WHERE id = ?`,
      [sendResult.success ? 'SENT' : 'FAILED', id]
    );
    
    res.status(200).json({
      success: true,
      message: `Campaign sent to ${recipients.length} recipients (${sendResult.successCount} successful, ${sendResult.errorCount} failed)`,
      data: {
        batchId,
        totalRecipients: recipients.length,
        successCount: sendResult.successCount,
        failCount: sendResult.errorCount
      }
    });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email campaign',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send a campaign to a single email address
 */
exports.sendSingleEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    console.log(`Sending campaign ${id} to single recipient: ${email}`);
    
    // Get the campaign details
    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!campaign || campaign.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Send the email using the same emailService as test emails
    const result = await emailService.sendTestCampaignEmail(campaign[0], email);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
    
    // Log the single email in the database
    await executeQueryWithLogging(
      `INSERT INTO email_campaign_logs (
        campaign_id, recipient, subject, sent, sent_at, is_test
      ) VALUES (?, ?, ?, 1, NOW(), 0)`,
      [id, email, campaign[0].subject]
    );
    
    res.status(200).json({
      success: true,
      message: `Email sent to ${email}`,
      data: {
        messageId: result.messageId
      }
    });
  } catch (error) {
    console.error('Error sending single campaign email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create promotion - updated to match exact database schema
 */
exports.createPromotion = async (req, res) => {
  try {
    console.log('Received promotion data:', req.body);
    
    // Extract all fields from request body
    const {
      name,
      description,
      code, // This field is missing in your SQL insert
      type,
      value,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      max_uses,
      is_active,
      applies_to,
      category_ids,
      product_ids,
      promotion_type,
      trigger_type,
      buy_quantity,
      get_quantity,
      segment_id,
      image_url,
      customer_description
    } = req.body;

    // Generate a unique code if not provided
    const uniqueCode = code || `AUTO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log('Using code for promotion:', uniqueCode);

    // Modify your SQL query to include the code column
    const query = `
      INSERT INTO promotions (
        store_id,
        name,
        description,
        code, /* Add this line */
        type,
        value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        max_uses,
        is_active,
        applies_to,
        category_ids,
        product_ids,
        promotion_type,
        trigger_type,
        buy_quantity,
        get_quantity,
        segment_id,
        image_url,
        customer_description,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    // Add the code parameter to your values array
    const params = [
      req.user?.storeId || 1,
      name,
      description,
      uniqueCode, /* Add this value */
      type || 'percentage',
      value || 0,
      min_purchase || 0,
      max_discount || null,
      start_date || new Date(),
      end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_uses || 100,
      is_active ? 1 : 0,
      applies_to || 'entire_order',
      JSON.stringify(category_ids || []),
      JSON.stringify(product_ids || []),
      promotion_type || 'automatic',
      trigger_type || 'cart_value',
      buy_quantity || null,
      get_quantity || null,
      segment_id || null,
      image_url || null,
      customer_description || ''
    ];

    console.log('Executing SQL with params:', params);
    
    const [result] = await executeQueryWithLogging(query, params);

    return res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      id: result.insertId,
      code: uniqueCode
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create promotion: ${error.message}`,
      error: error.message
    });
  }
};

/**
 * Update promotion
 * @route PUT /api/marketing/promotions/:id
 */
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Extract all possible fields from the request body
    const {
      name,
      description,
      type,
      value,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      usage_limit_per_user,
      applies_to,
      category_ids,
      product_ids,
      segment_id,
      image_url,
      is_active,
      promotion_type,
      trigger_type,
      customer_description,
      buy_quantity,
      get_quantity
    } = req.body;
    
    console.log(`Updating promotion ${id} with data:`, req.body);
    
    // Format dates properly for MySQL DATE type
    const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : null;
    const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : null;
    
    // Construct the SQL update query
    const query = `
      UPDATE promotions SET
        name = ?,
        description = ?,
        type = ?,
        value = ?,
        min_purchase = ?,
        max_discount = ?,
        start_date = ?,
        end_date = ?,
        max_uses = ?,
        is_active = ?,
        applies_to = ?,
        category_ids = ?,
        product_ids = ?,
        promotion_type = ?,
        trigger_type = ?,
        buy_quantity = ?,
        get_quantity = ?,
        segment_id = ?,
        image_url = ?,
        customer_description = ?
      WHERE id = ? AND store_id = ?`;
    
    const params = [
      name,
      description || null,
      type,
      parseFloat(value) || 0,
      parseFloat(min_purchase) || 0,
      max_discount ? parseFloat(max_discount) : null,
      formattedStartDate,
      formattedEndDate,
      usage_limit ? parseInt(usage_limit) : null,
      is_active ? 1 : 0,
      applies_to || 'all',
      category_ids ? JSON.stringify(category_ids) : null,
      product_ids ? JSON.stringify(product_ids) : null,
      promotion_type || 'automatic',
      trigger_type || 'cart_value',
      buy_quantity ? parseInt(buy_quantity) : null,
      get_quantity ? parseInt(get_quantity) : null,
      segment_id || null,
      image_url || null,
      customer_description || null,
      id,
      req.user?.storeId || 1
    ];
    
    const result = await executeQueryWithLogging(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found or no changes made'
      });
    }
    
    // Get the updated promotion
    const updatedPromotion = await executeQueryWithLogging(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    );
    
    if (!updatedPromotion || updatedPromotion.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Updated promotion could not be retrieved'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedPromotion[0]
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion: ' + (error.sqlMessage || error.message),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle promotion active status
 * @route PATCH /api/marketing/promotions/:id/toggle
 */
exports.togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    console.log(`Toggling promotion ${id} active status to:`, is_active);
    
    // Get current promotion data to ensure it exists
    const currentPromotion = await executeQueryWithLogging(
      'SELECT * FROM promotions WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!currentPromotion || currentPromotion.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    // Update just the is_active field
    const result = await executeQueryWithLogging(
      `UPDATE promotions SET
        is_active = ?,
        updated_at = NOW()
      WHERE id = ? AND store_id = ?`,
      [
        is_active ? 1 : 0,
        id,
        req.user?.storeId || 1
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found or no changes made'
      });
    }
    
    // Get the updated promotion with all fields
    const updatedPromotion = await executeQueryWithLogging(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    );
    
    if (!updatedPromotion || updatedPromotion.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found after status update'
      });
    }
    
    // Add additional calculated fields that the client might expect
    const promotion = {
      ...updatedPromotion[0],
      // Add any calculated fields or transformations here
      status: calculatePromotionStatus(updatedPromotion[0]),
      usage_limit: updatedPromotion[0].max_uses
    };
    
    res.status(200).json({
      success: true,
      message: `Promotion ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: promotion
    });
  } catch (error) {
    console.error('Error toggling promotion status:', error);
    console.error('SQL Error details:', error.sqlMessage || 'No SQL message');
    console.error('SQL Error code:', error.code || 'No error code');
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle promotion status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to calculate promotion status based on dates and active flag
 */
function calculatePromotionStatus(promotion) {
  const now = new Date();
  const startDate = new Date(promotion.start_date);
  const endDate = new Date(promotion.end_date);
  
  if (!promotion.is_active) {
    return 'inactive';
  } else if (now < startDate) {
    return 'scheduled';
  } else if (now > endDate) {
    return 'expired';
  } else {
    return 'active';
  }
}

/**
 * Get campaign analytics
 */
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get base campaign info
    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!campaign || campaign.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Get analytics stats
    const stats = await executeQueryWithLogging(`
      SELECT 
        COUNT(*) as sent,
        SUM(opened) as opened,
        SUM(clicked) as clicked,
        SUM(bounced) as bounced
      FROM email_campaign_logs
      WHERE campaign_id = ? AND is_test = 0
    `, [id]);
    
    // Return analytics data
    res.status(200).json({
      success: true,
      data: {
        ...campaign[0],
        analytics: {
          sent: parseInt(stats[0]?.sent || 0),
          opened: parseInt(stats[0]?.opened || 0),
          clicked: parseInt(stats[0]?.clicked || 0),
          bounced: parseInt(stats[0]?.bounced || 0),
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
          timeDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
          topLinks: []
        }
      }
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign analytics'
    });
  }
};