const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
require('dotenv').config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password'
  },
  connectionTimeout: 5000, // 5 seconds
  socketTimeout: 10000 // 10 seconds
});

// Verify configuration
transporter.verify((error) => {
  if (error) {
    console.error('Error verifying transporter:', error);
  } else {
    console.log('Email server is ready to send emails');
  }
});

/**
 * Send a single email
 * @param {Object} mailOptions - Email options (from, to, subject, html)
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Read and compile an email template
 * @param {string} templateName - Template file name
 * @param {Object} data - Data to inject into template
 * @returns {Promise<string>} Compiled HTML
 */
const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template({
      ...data,
      year: new Date().getFullYear(),
      unsubscribeLink: `${process.env.API_URL}/api/marketing/unsubscribe?email=${encodeURIComponent(data.email)}`
    });
  } catch (error) {
    console.error('Error compiling template:', error);
    return data.content; // Fallback to basic content
  }
};

/**
 * Send a test campaign email 
 * @param {Object} campaign - Campaign object with content, subject, etc.
 * @param {string} testEmail - Recipient email address
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendTestCampaignEmail = async (campaign, testEmail) => {
  try {
    // Try to use template, fall back to raw content if fails
    let htmlContent;
    try {
      htmlContent = await compileTemplate('campaignTemplate', {
        ...campaign,
        firstName: 'Test User',
        email: testEmail
      });
    } catch (err) {
      console.log('Template error, using raw content:', err.message);
      htmlContent = campaign.content;
    }
    
    const mailOptions = {
      from: `"${campaign.from_name}" <${campaign.from_email}>`,
      to: testEmail,
      subject: campaign.subject,
      html: htmlContent
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendTestCampaignEmail:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send campaign emails in batches
 * @param {Object} campaign - Campaign object
 * @param {Array<Object>} recipients - Array of recipient objects
 * @param {number} batchSize - Number of emails to send in each batch
 * @returns {Promise<Object>} - Success status and count
 */
const sendCampaignEmails = async (campaign, recipients, batchSize = 10) => {
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // Process recipients in batches to avoid overwhelming the email server
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Create an array of promises for the current batch
      const promises = batch.map(async (recipient) => {
        try {
          // Personalize content for each recipient
          let personalizedContent = campaign.content
            .replace(/\[FIRST_NAME\]/g, recipient.first_name || '')
            .replace(/\[LAST_NAME\]/g, recipient.last_name || '')
            .replace(/\[EMAIL\]/g, recipient.email || '');
          
          const mailOptions = {
            from: `"${campaign.from_name}" <${campaign.from_email}>`,
            to: recipient.email,
            subject: campaign.subject,
            html: personalizedContent
          };
          
          const result = await sendEmail(mailOptions);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
          return result;
        } catch (error) {
          errorCount++;
          console.error(`Error sending to ${recipient.email}:`, error);
          return { success: false, error: error.message };
        }
      });
      
      // Wait for all emails in this batch to be sent
      await Promise.all(promises);
      
      // Add a pause between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
      success: true,
      successCount,
      errorCount,
      totalAttempted: recipients.length
    };
  } catch (error) {
    console.error('Error in sendCampaignEmails:', error);
    return {
      success: false,
      error: error.message,
      successCount,
      errorCount,
      totalAttempted: recipients.length
    };
  }
};

module.exports = {
  sendEmail,
  sendTestCampaignEmail,
  sendCampaignEmails
};