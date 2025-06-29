const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const { createPurchaseOrderPdf } = require('../utils/pdfGenerator');
require('dotenv').config();

// Create reusable transporter object without verification
// Gmail often blocks connections from "less secure apps"
// You'll need to enable "Less secure app access" in your Google account
// or use OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Email transporter created');

/**
 * Test email configuration by sending a test email
 * @returns {Promise<boolean>} Success status
 */
const testEmailConfig = async () => {
  try {
    const testMailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email',
      text: 'If you receive this email, your email configuration is working correctly.'
    };
    
    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

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
      unsubscribeLink: `${process.env.API_URL}/api/marketing/unsubscribe?email=${encodeURIComponent(data.email || '')}`
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

/**
 * Get status color for purchase order emails
 * @param {string} status - Purchase order status
 * @returns {string} - Color hex code
 */
const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return '#9e9e9e';
    case 'pending': return '#ff9800';
    case 'sent': return '#2196f3';
    case 'confirmed': return '#4caf50';
    case 'canceled': return '#f44336';
    default: return '#9e9e9e';
  }
};

/**
 * Format purchase order data for email template
 * @param {Object} purchaseOrder - Purchase order data
 * @param {string} message - Custom message for the email
 * @returns {Object} - Formatted data for the template
 */
const formatPurchaseOrderData = (purchaseOrder, message) => {
  // Extract values with defaults and ensure we check both camelCase and snake_case
  const poNumber = purchaseOrder?.po_number || purchaseOrder?.poNumber || 'N/A';
  const status = purchaseOrder?.status || 'draft';
  const supplierName = purchaseOrder?.supplierName || 
                     (purchaseOrder?.supplier && (purchaseOrder.supplier.name || purchaseOrder.supplier.Name)) || 
                     'Supplier';
  const orderDate = new Date(purchaseOrder?.order_date || purchaseOrder?.orderDate || Date.now()).toLocaleDateString();
  const expectedDeliveryDate = purchaseOrder?.expected_delivery_date || purchaseOrder?.expectedDeliveryDate
    ? new Date(purchaseOrder.expected_delivery_date || purchaseOrder.expectedDeliveryDate).toLocaleDateString()
    : "Not specified";
  
  // Calculate total amount correctly from items if total is missing or zero
  let subtotal = parseFloat(purchaseOrder?.subtotal || 0);
  let totalAmount = parseFloat(purchaseOrder?.total_amount || purchaseOrder?.totalAmount || 0);
  const taxRate = parseFloat(purchaseOrder?.taxRate || purchaseOrder?.tax_rate || 0);
  const taxAmount = parseFloat(purchaseOrder?.taxAmount || purchaseOrder?.tax_amount || (subtotal * taxRate / 100) || 0);
  const shippingCost = parseFloat(purchaseOrder?.shippingCost || purchaseOrder?.shipping_cost || 0);
  
  // Check if we have items
  const items = Array.isArray(purchaseOrder?.items) ? purchaseOrder.items : [];
  const hasItems = items.length > 0;
  
  // Format item data
  const formattedItems = items.map(item => {
    const quantity = parseInt(item?.quantity || 0);
    const unitPrice = parseFloat(item?.unitPrice || item?.unit_price || 0);
    const total = parseFloat(item?.total || (quantity * unitPrice) || 0);
    
    return {
      productName: item?.productName || item?.product_name || 'Unknown Product',
      quantity,
      unitPrice: unitPrice.toFixed(2),
      total: total.toFixed(2)
    };
  });
  
  return {
    poNumber,
    status: status.toUpperCase(),
    statusColor: getStatusColor(status),
    statusStyle: `background-color: ${getStatusColor(status)};`,
    supplierName,
    orderDate,
    expectedDeliveryDate,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    taxRate,
    shippingCost: shippingCost.toFixed(2),
    formattedTotal: totalAmount.toFixed(2),
    message: message || `Please find attached purchase order #${poNumber} for your review.`,
    items: formattedItems,
    hasItems,
    email: purchaseOrder?.supplierEmail || 
           (purchaseOrder?.supplier && (purchaseOrder.supplier.email || purchaseOrder.supplier.Email)) || 
           ''
  };
};

/**
 * Send purchase order email
 * @param {Object} purchaseOrder - Purchase order data
 * @param {string} recipientEmail - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Custom message for the email
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendPurchaseOrderEmail = async (purchaseOrder, recipientEmail, subject, message) => {
  try {
    if (!purchaseOrder) {
      throw new Error('Purchase order data not provided');
    }
    
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }
    
    // Debug PO object
    console.log('Creating PO email, PO numbers:', JSON.stringify({
      po_number: purchaseOrder.po_number,
      poNumber: purchaseOrder.poNumber,
      id: purchaseOrder.id
    }));
    
    // Generate PDF
    const pdfBuffer = await createPurchaseOrderPdf(purchaseOrder);
    
    // Format data for template
    const templateData = formatPurchaseOrderData(purchaseOrder, message);
    
    // Get PO number for subject
    const poNumber = purchaseOrder?.po_number || purchaseOrder?.poNumber || 'N/A';
    
    // Create HTML email content
    const htmlContent = await compileTemplate('purchaseOrderTemplate', templateData);
    
    // Email options
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: recipientEmail,
      subject: subject || `Purchase Order #${poNumber}`,
      html: htmlContent,
      attachments: [
        {
          filename: `PO-${poNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    // Send email
    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('Error in sendPurchaseOrderEmail:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendTestCampaignEmail,
  sendCampaignEmails,
  sendPurchaseOrderEmail,
  compileTemplate,
  testEmailConfig
};