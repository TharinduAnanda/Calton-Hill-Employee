const emailService = require('../services/emailService');

// Updated sendTestEmail function
exports.sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email_address } = req.body;

    const campaign = await executeQueryWithLogging(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [id]
    );

    if (!campaign || campaign.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    const result = await emailService.sendTestCampaignEmail(
      campaign[0], 
      email_address
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }

    // Log the test email
    await executeQueryWithLogging(
      `INSERT INTO email_campaign_logs 
        (campaign_id, recipient, subject, sent, sent_at, is_test)
       VALUES (?, ?, ?, 1, NOW(), 1)`,
      [id, email_address, campaign[0].subject]
    );

    res.status(200).json({
      success: true,
      message: `Test email sent to ${email_address}`,
      data: {
        messageId: result.messageId
      }
    });
  } catch (error) {
    console.error('Error in sendTestEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
};