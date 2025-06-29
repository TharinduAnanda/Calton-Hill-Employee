const PDFDocument = require('pdfkit');

/**
 * Create a PDF buffer for a purchase order with perfect alignment using Courier
 * @param {Object} purchaseOrder - The purchase order data
 * @returns {Promise<Buffer>} - A buffer containing the PDF data
 */
const createPurchaseOrderPdf = async (purchaseOrder) => {
  return new Promise((resolve, reject) => {
    try {
      // Define colors
      const colors = {
        primary: '#1976d2',
        background: '#ffffff',
        tableHeader: '#1976d2',
        tableRowOdd: '#f5f5f5',
        tableRowEven: '#ffffff',
        textDark: '#263238',
        textLight: '#78909c',
        border: '#cfd8dc'
      };

      // Create document with Courier font
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: `Purchase Order ${purchaseOrder?.po_number || 'N/A'}`,
          Author: 'Calton Hill Hardware'
        }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Initialize position tracker
      let yPos = 40;

      // Extract data with fallbacks
      const poNumber = purchaseOrder?.po_number || 'N/A';
      const orderDate = new Date(purchaseOrder?.order_date || Date.now()).toLocaleDateString();
      const status = purchaseOrder?.status || 'draft';
      
      // Handle supplier info with uppercase or lowercase field names
      const supplierName = purchaseOrder?.supplier?.name || purchaseOrder?.supplier?.Name || 'N/A';
      const supplierEmail = (purchaseOrder?.supplier?.email || purchaseOrder?.supplier?.Email || 'N/A').replace(/@/g, '\n@'); // Fix for email alignment
      const supplierPhone = purchaseOrder?.supplier?.phone || purchaseOrder?.supplier?.Phone_Number || 'N/A';
      const supplierContact = purchaseOrder?.supplier?.contact_person || purchaseOrder?.supplier?.Contact_Person || 'N/A';
      
      // Log the supplier object to debug address fields
      console.log('PDF Generator - Supplier data:', JSON.stringify(purchaseOrder?.supplier, null, 2));
      
      // Format address from individual components
      // Try multiple approaches to get the address fields
      const street = purchaseOrder?.supplier?.street || purchaseOrder?.street || '';
      const city = purchaseOrder?.supplier?.city || purchaseOrder?.city || '';
      const state = purchaseOrder?.supplier?.state || purchaseOrder?.state || '';
      const zipCode = purchaseOrder?.supplier?.zipCode || purchaseOrder?.zipCode || '';
      const country = purchaseOrder?.supplier?.country || purchaseOrder?.country || '';
      
      console.log('PDF Generator - Address components:', { street, city, state, zipCode, country });
      
      // Format the full address 
      // First check if supplier already has a formattedAddress
      let formattedAddress = purchaseOrder?.supplier?.formattedAddress;
      
      // If not, build it from components
      if (!formattedAddress) {
        formattedAddress = [
          street,
          city,
          `${state}${zipCode ? ' ' + zipCode : ''}`,
          country
        ].filter(part => part.trim() !== '').join(', ');
      }
      
      // If still empty, use a fallback
      if (!formattedAddress || formattedAddress.trim() === '') {
        formattedAddress = 'Address not provided';
      }
      
      console.log('PDF Generator - Formatted address:', formattedAddress);

      const expectedDeliveryDate = purchaseOrder?.expected_delivery_date 
        ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()
        : "Not specified";
      const paymentStatus = purchaseOrder?.payment_status || 'Unpaid';
      const paymentTerms = purchaseOrder?.payment_terms || 'Net 30';
      const notes = purchaseOrder?.notes || '';

      // Calculate totals
      let subtotal = 0;
      const items = Array.isArray(purchaseOrder?.items) ? purchaseOrder.items : [];
      items.forEach(item => {
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        subtotal += qty * price;
      });

      const taxRate = parseFloat(purchaseOrder?.tax_rate) || 0;
      const taxAmount = subtotal * taxRate / 100;
      const shippingCost = parseFloat(purchaseOrder?.shipping_cost) || 0;
      const discountAmount = parseFloat(purchaseOrder?.discount_amount) || 0;
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

      // Helper functions
      const drawLine = (y) => {
        doc.moveTo(40, y).lineTo(555, y).stroke();
      };

      const drawRect = (x, y, w, h, fill) => {
        doc.rect(x, y, w, h).fill(fill);
      };

      // Check if we need to add a new page before drawing content
      const checkNewPage = (height) => {
        if (yPos + height > doc.page.height - 50) {
          doc.addPage();
          yPos = 40; // Reset to top of new page with margin
          return true;
        }
        return false;
      };

      // Set monospace font for everything
      doc.font('Courier');

      // HEADER
      doc.fontSize(18).text('CALTON HILL HARDWARE', 40, 40);
      doc.fontSize(10).text('Quality products for your everyday needs', 40, 65);
      doc.fontSize(9).text('100/1 Rakwana Road, Sabaragamuwa, 70300, Sri Lanka', 40, 80);
      doc.text(`Email: caltonhillrakwana@gmail.com | Phone: +94 45 222 5889`, 40, 95);

      // PO Box
      doc.fontSize(12).text('PURCHASE ORDER', 400, 45);
      doc.fontSize(16).text(`#${poNumber}`, 400, 65);

      // STATUS SECTION
      drawLine(120);
      doc.fontSize(9).text('CREATION DATE', 40, 130);
      doc.text('EXPECTED DELIVERY', 180, 130);
      doc.text('PAYMENT STATUS', 320, 130);
      doc.text('TOTAL AMOUNT', 460, 130);
      
      doc.fontSize(10);
      doc.text(orderDate, 40, 150);
      doc.text(expectedDeliveryDate, 180, 150);
      doc.text(paymentStatus, 320, 150);
      doc.fontSize(12).text(`$${totalAmount.toFixed(2)}`, 460, 145);



      // SUPPLIER SECTION
      drawLine(180);
      doc.fontSize(10).text('Supplier Information', 40, 190);
      
      // Define table dimensions and spacing
      const tableTop = 220;
      const tableWidth = 515;
      const colWidths = [170, 170, 170]; // Widths for name, email, phone
      const rowHeight = 30;
      const padding = 5;
      
      // Calculate column positions
      const colPos = [40];
      for (let i = 1; i < colWidths.length; i++) {
        colPos[i] = colPos[i-1] + colWidths[i-1] + 5; // Add small gap between columns
      }
      
      // Draw table headers with background
      doc.fillColor(colors.tableHeader);
      drawRect(40, tableTop, tableWidth, rowHeight, colors.tableHeader);
      doc.fillColor('#ffffff').fontSize(9);
      doc.text('SUPPLIER NAME', colPos[0] + padding, tableTop + padding);
      doc.text('EMAIL', colPos[1] + padding, tableTop + padding);
      doc.text('PHONE', colPos[2] + padding, tableTop + padding);
      

      
      // Calculate row height based on the content
      // Just use a reasonable default since we removed the address column
      const dataRowHeight = Math.max(rowHeight, 40);
      
      // Draw table data row
      doc.fillColor(colors.tableRowOdd);
      drawRect(40, tableTop + rowHeight, tableWidth, dataRowHeight, colors.tableRowOdd);
      doc.fillColor(colors.textDark).fontSize(10);
      
      // Add data to cells with text wrapping as needed
      doc.text(supplierName, colPos[0] + padding, tableTop + rowHeight + padding, {
        width: colWidths[0] - (padding * 2)
      });
      
      // Clean up email (no manual line breaks)
      const cleanEmail = supplierEmail.replace(/\n/g, '');
      doc.text(cleanEmail, colPos[1] + padding, tableTop + rowHeight + padding, {
        width: colWidths[1] - (padding * 2)
      });
      
      doc.text(supplierPhone, colPos[2] + padding, tableTop + rowHeight + padding, {
        width: colWidths[2] - (padding * 2)
      });
      
      // Update yPos for next section
      yPos = tableTop + rowHeight + dataRowHeight + 20;

      // Address section below supplier table
      doc.fontSize(9).text('SUPPLIER ADDRESS', 40, yPos);
      yPos += 20;
      doc.fontSize(10).text(formattedAddress, 40, yPos, { width: tableWidth });
      
      // Calculate space needed for address text
      const addressSpace = doc.heightOfString(formattedAddress, { width: tableWidth }) + 15;
      yPos += addressSpace;

      // ITEMS TABLE
      drawLine(yPos);
      yPos += 10;
      doc.fontSize(10).text('Order Items', 40, yPos);
      doc.fontSize(9).text(`${items.length} items`, 500, yPos);
      yPos += 20;

      // Table header
      drawRect(40, yPos, 515, 20, colors.tableHeader);
      doc.fillColor('#ffffff').fontSize(10);
      
      // Using fixed-width columns with Courier
      // Positions: 40, 150, 260, 370, 450, 555
      doc.text('PRODUCT', 45, yPos + 5);
      doc.text('DESCRIPTION', 155, yPos + 5);
      doc.text('QTY', 265, yPos + 5, { width: 100, align: 'center' });
      doc.text('UNIT PRICE', 375, yPos + 5, { width: 100, align: 'right' });
      doc.text('TOTAL', 455, yPos + 5, { width: 100, align: 'right' });
      
      // Move to data rows
      yPos += 20;
items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? colors.tableRowOdd : colors.tableRowEven;
        drawRect(40, yPos, 515, 20, bgColor);
        
        doc.fillColor(colors.textDark).fontSize(9);
        const name = item.product_name || 'N/A';
        const desc = item.description || '';
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const total = qty * price;

        // Truncate long text to fit columns
        doc.text(name.substring(0, 20), 45, yPos + 5);
        doc.text(desc.substring(0, 30), 155, yPos + 5);
        doc.text(qty.toString(), 265, yPos + 5, { width: 100, align: 'center' });
        doc.text(`$${price.toFixed(2)}`, 375, yPos + 5, { width: 100, align: 'right' });
        doc.text(`$${total.toFixed(2)}`, 455, yPos + 5, { width: 100, align: 'right' });
        
        yPos += 20;
        
        // Check if we need a new page for the next item
        if (index < items.length - 1 && yPos + 20 > doc.page.height - 50) {
          doc.addPage();
          yPos = 40;
          
          // Redraw header on new page
          drawRect(40, yPos, 515, 20, colors.tableHeader);
          doc.fillColor('#ffffff').fontSize(10);
          doc.text('PRODUCT', 45, yPos + 5);
          doc.text('DESCRIPTION', 155, yPos + 5);
          doc.text('QTY', 265, yPos + 5, { width: 100, align: 'center' });
          doc.text('UNIT PRICE', 375, yPos + 5, { width: 100, align: 'right' });
          doc.text('TOTAL', 455, yPos + 5, { width: 100, align: 'right' });
          yPos += 20;
        }
      });

      // ORDER SUMMARY
      yPos += 30;
      // Check if we need a new page for order summary
      if (checkNewPage(150)) {
        // If we started a new page, we need less spacing
        yPos += 10;
      }

      doc.fontSize(10).text('Order Summary', 40, yPos);
      yPos += 30;

      // Summary box right-aligned
      doc.fontSize(9);
      doc.text(`Payment Terms: ${paymentTerms}`, 40, yPos);
      
      // Summary values
      const summaryX = 400;
      doc.text('Subtotal:', summaryX, yPos, { width: 100, align: 'right' });
      doc.text(`$${subtotal.toFixed(2)}`, 500, yPos, { width: 55, align: 'right' });
      yPos += 15;
      
      doc.text(`Tax (${taxRate}%):`, summaryX, yPos, { width: 100, align: 'right' });
      doc.text(`$${taxAmount.toFixed(2)}`, 500, yPos, { width: 55, align: 'right' });
      yPos += 15;
      
      doc.text('Shipping:', summaryX, yPos, { width: 100, align: 'right' });
      doc.text(`$${shippingCost.toFixed(2)}`, 500, yPos, { width: 55, align: 'right' });
      yPos += 15;
      
      doc.text('Discount:', summaryX, yPos, { width: 100, align: 'right' });
      doc.text(`-$${discountAmount.toFixed(2)}`, 500, yPos, { width: 55, align: 'right' });
      yPos += 20;
      
      drawLine(yPos);
      yPos += 5;
      
      doc.fontSize(11).text('TOTAL:', summaryX, yPos, { width: 100, align: 'right' });
      doc.text(`$${totalAmount.toFixed(2)}`, 500, yPos, { width: 55, align: 'right' });

      // NOTES
if (notes) {
  yPos += 40;
  doc.fontSize(10).text('Notes', 40, yPos);
  yPos += 20;
  doc.fontSize(9).text(notes, 40, yPos, { width: 515 });
  yPos += notes.length > 100 ? 80 : 40; // Add space based on notes length
}

      // FOOTER - Place at the current position (end of content)
      // Check if we need more space for footer
      if (yPos > doc.page.height - 60) {
        doc.addPage();
        yPos = 40;
      }

      drawLine(yPos);
      yPos += 10;
      doc.fontSize(8).text(`Purchase Order #${poNumber} - Created on ${orderDate}`, 40, yPos);
      yPos += 15;
      doc.text('© Calton Hill Hardware. All rights reserved.', 40, yPos);

      // PAGE NUMBER - Only show if there are multiple pages
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`, 500, doc.page.height - 30, { align: 'right' });
      }

      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

/**
 * Create a PDF buffer for stock movement history
 * @param {Array} movements - The stock movement data
 * @param {Object} options - Options for PDF generation
 * @returns {Promise<Buffer>} - A buffer containing the PDF data
 */
const createStockMovementPdf = async (movements, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Define colors
      const colors = {
        primary: '#1976d2',
        background: '#ffffff',
        tableHeader: '#1976d2',
        tableRowOdd: '#f5f5f5',
        tableRowEven: '#ffffff',
        textDark: '#263238',
        textLight: '#78909c',
        border: '#cfd8dc',
        increase: '#4caf50',
        decrease: '#f44336'
      };

      // Create document
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: `Stock Movement History Report`,
          Author: 'Calton Hill Hardware',
          Subject: 'Inventory Stock Movements',
          Keywords: 'inventory, stock, movements'
        }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Initialize position tracker
      let yPos = 40;

      // Helper functions
      const drawLine = (y) => {
        doc.moveTo(40, y).lineTo(555, y).stroke();
      };

      const drawRect = (x, y, w, h, fill) => {
        doc.rect(x, y, w, h).fill(fill);
      };

      // Check if we need to add a new page before drawing content
      const checkNewPage = (height) => {
        if (yPos + height > doc.page.height - 50) {
          doc.addPage();
          yPos = 40; // Reset to top of new page with margin
          
          // Add header to new page
          addPageHeader();
          return true;
        }
        return false;
      };
      
      // Function to add page header
      const addPageHeader = () => {
        doc.fontSize(18).fillColor(colors.primary).text('CALTON HILL HARDWARE', 40, yPos);
        yPos += 25;
        doc.fontSize(14).fillColor(colors.primary).text('STOCK MOVEMENT HISTORY', 40, yPos);
        yPos += 20;
        
        // Add date range if provided
        if (options.startDate || options.endDate) {
          let dateText = "Period: ";
          if (options.startDate) {
            dateText += `From ${options.startDate}`;
          }
          if (options.endDate) {
            dateText += ` To ${options.endDate}`;
          }
          doc.fontSize(10).fillColor(colors.textDark).text(dateText, 40, yPos);
          yPos += 15;
        }
        
        // Add report generation timestamp
        const now = new Date();
        doc.fontSize(9).fillColor(colors.textLight).text(`Report generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 40, yPos);
        yPos += 20;
        
        drawLine(yPos);
        yPos += 20;
      };
      
      // Add header to first page
      addPageHeader();
      
      // Summary section
      if (Array.isArray(movements) && movements.length > 0) {
        // Calculate some statistics
        let totalIncrease = 0;
        let totalDecrease = 0;
        const uniqueItems = new Set();
        const uniqueTypes = new Set();
        
        movements.forEach(move => {
          if (move.quantityChange > 0) {
            totalIncrease += move.quantityChange;
          } else {
            totalDecrease += Math.abs(move.quantityChange);
          }
          
          if (move.itemName) uniqueItems.add(move.itemName);
          if (move.type) uniqueTypes.add(move.type);
        });
        
        // Draw summary box
        doc.fillColor(colors.background);
        drawRect(40, yPos, 515, 80, colors.background);
        doc.rect(40, yPos, 515, 80).stroke();
        
        // Summary content
        doc.fillColor(colors.textDark);
        doc.fontSize(12).text('SUMMARY', 50, yPos + 10);
        
        doc.fontSize(10);
        doc.text(`Total Records: ${movements.length}`, 50, yPos + 30);
        doc.text(`Unique Items: ${uniqueItems.size}`, 50, yPos + 45);
        doc.text(`Movement Types: ${uniqueTypes.size}`, 50, yPos + 60);
        
        doc.text(`Total Increases: +${totalIncrease}`, 300, yPos + 30);
        doc.text(`Total Decreases: -${totalDecrease}`, 300, yPos + 45);
        doc.text(`Net Change: ${totalIncrease - totalDecrease}`, 300, yPos + 60);
        
        yPos += 100;
      }
      
      // Main table header
      drawRect(40, yPos, 515, 30, colors.tableHeader);
      doc.fillColor('#ffffff').fontSize(10);
      
      const colWidths = [80, 140, 50, 50, 50, 80, 65];
      const colPositions = [40]; // Start position
      
      for (let i = 1; i < colWidths.length; i++) {
        colPositions[i] = colPositions[i-1] + colWidths[i-1];
      }
      
      doc.text('DATE', colPositions[0] + 5, yPos + 10);
      doc.text('ITEM', colPositions[1] + 5, yPos + 10);
      doc.text('PREV QTY', colPositions[2] + 5, yPos + 10);
      doc.text('CHANGE', colPositions[3] + 5, yPos + 10);
      doc.text('NEW QTY', colPositions[4] + 5, yPos + 10);
      doc.text('TYPE', colPositions[5] + 5, yPos + 10);
      doc.text('USER', colPositions[6] + 5, yPos + 10);
      
      yPos += 30;
      
      // Table rows
      if (Array.isArray(movements) && movements.length > 0) {
        movements.forEach((movement, index) => {
          // Check if we need a new page
          if (checkNewPage(30)) {
            // If we started a new page, redraw the table header
            drawRect(40, yPos, 515, 30, colors.tableHeader);
            doc.fillColor('#ffffff').fontSize(10);
            
            doc.text('DATE', colPositions[0] + 5, yPos + 10);
            doc.text('ITEM', colPositions[1] + 5, yPos + 10);
            doc.text('PREV QTY', colPositions[2] + 5, yPos + 10);
            doc.text('CHANGE', colPositions[3] + 5, yPos + 10);
            doc.text('NEW QTY', colPositions[4] + 5, yPos + 10);
            doc.text('TYPE', colPositions[5] + 5, yPos + 10);
            doc.text('USER', colPositions[6] + 5, yPos + 10);
            
            yPos += 30;
          }
          
          // Row background
          const bgColor = index % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd;
          drawRect(40, yPos, 515, 25, bgColor);
          
          // Format date
          let dateStr = '';
          if (movement.date) {
            if (movement.date instanceof Date) {
              dateStr = `${movement.date.toLocaleDateString()} ${movement.date.toLocaleTimeString().substring(0, 5)}`;
            } else if (typeof movement.date === 'string') {
              const date = new Date(movement.date);
              if (!isNaN(date.getTime())) {
                dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString().substring(0, 5)}`;
              } else {
                dateStr = movement.date;
              }
            }
          }
          
          // Row data
          doc.fillColor(colors.textDark).fontSize(9);
          doc.text(dateStr, colPositions[0] + 5, yPos + 8, { width: colWidths[0] - 10 });
          doc.text(movement.itemName || 'Unknown', colPositions[1] + 5, yPos + 8, { width: colWidths[1] - 10 });
          doc.text(movement.previousQuantity?.toString() || '0', colPositions[2] + 5, yPos + 8, { width: colWidths[2] - 10 });
          
          // Change with color
          const quantityChange = movement.quantityChange || 0;
          const changeText = quantityChange > 0 ? `+${quantityChange}` : quantityChange.toString();
          doc.fillColor(quantityChange > 0 ? colors.increase : (quantityChange < 0 ? colors.decrease : colors.textDark));
          doc.text(changeText, colPositions[3] + 5, yPos + 8, { width: colWidths[3] - 10 });
          
          // Back to regular color
          doc.fillColor(colors.textDark);
          doc.text(movement.newQuantity?.toString() || '0', colPositions[4] + 5, yPos + 8, { width: colWidths[4] - 10 });
          doc.text(movement.type || 'Unknown', colPositions[5] + 5, yPos + 8, { width: colWidths[5] - 10 });
          doc.text(movement.username || 'System', colPositions[6] + 5, yPos + 8, { width: colWidths[6] - 10 });
          
          yPos += 25;
        });
      } else {
        // No data message
        doc.fillColor(colors.textDark).fontSize(11);
        doc.text('No stock movement records found for the selected period.', 40, yPos + 30);
        yPos += 60;
      }
      
      yPos += 20;
      
      // Footer
      drawLine(yPos);
      yPos += 15;
      doc.fontSize(8).fillColor(colors.textLight);
      doc.text('© Calton Hill Hardware. This report contains confidential information.', 40, yPos);
      
      // Add page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(colors.textLight);
        doc.text(`Page ${i + 1} of ${pageCount}`, 500, doc.page.height - 30, { align: 'right' });
      }
      
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

/**
 * Create a PDF buffer for inventory turnover report
 * @param {Object} turnoverData - The inventory turnover data
 * @param {Object} options - Options like period, category filter
 * @returns {Promise<Buffer>} - A buffer containing the PDF data
 */
const createInventoryTurnoverPdf = async (turnoverData, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Define modern color scheme
      const colors = {
        primary: '#2563eb',        // Royal blue
        secondary: '#0ea5e9',      // Sky blue
        accent: '#f59e0b',         // Amber
        success: '#10b981',        // Emerald
        danger: '#ef4444',         // Red
        warning: '#f97316',        // Orange
        info: '#3b82f6',           // Blue
        dark: '#1e293b',           // Slate
        light: '#f8fafc',          // Gray-50
        background: '#ffffff',
        tableBg1: '#f1f5f9',       // Gray-100
        tableBg2: '#ffffff',
        tableHeaderBg: '#1e40af',  // Dark blue
        borderColor: '#e2e8f0'     // Gray-200
      };

      // Create document with Helvetica font
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        font: 'Helvetica',
        info: {
          Title: 'Inventory Turnover Analysis Report',
          Author: 'Calton Hill Hardware',
          Subject: 'Inventory Management',
          Keywords: 'inventory, turnover, analysis, dsi, hardware'
        }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Initialize position tracker
      let yPos = 50;

      // Formatting helpers
      const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format;

      const numberFormatter = (value) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);
      };

      // Helper functions
      const drawLine = (y, color = colors.borderColor, width = 0.5) => {
        doc.strokeColor(color).lineWidth(width).moveTo(40, y).lineTo(555, y).stroke();
      };

      const drawRect = (x, y, w, h, fill) => {
        doc.rect(x, y, w, h).fill(fill);
      };

      // Check if we need to add a new page before drawing content
      const checkNewPage = (height) => {
        if (yPos + height > doc.page.height - 60) {
          doc.addPage();
          yPos = 50; // Reset to top of new page with margin
          
          // Add header to new page
          doc.fontSize(10).fillColor(colors.dark).text('INVENTORY TURNOVER REPORT - Continued', 40, 20);
          drawLine(35, colors.borderColor, 0.5);
          
          return true;
        }
        return false;
      };

      // Extract data from the turnover data object
      const summary = turnoverData?.summary || {
        total_inventory_value: 0,
        total_cogs: 0,
        overall_turnover_ratio: 0,
        overall_dsi: 0,
        product_count: 0,
        category_count: 0
      };

      const products = Array.isArray(turnoverData?.products) ? turnoverData.products : [];
      const categories = Array.isArray(turnoverData?.categories) ? turnoverData.categories : [];

      // HEADER SECTION - More professional and modern
      // Logo/Title box
      doc.rect(40, yPos - 10, 515, 70).fillColor(colors.primary).fill();
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('CALTON HILL HARDWARE', 50, yPos);
      yPos += 28;
      doc.fontSize(14).font('Helvetica').text('INVENTORY TURNOVER REPORT', 50, yPos);
      yPos += 30;

      // Add date information
      const now = new Date();
      const period = options.period || 90;
      const startDate = options.startDate || summary.start_date || new Date(now.getTime() - period * 24 * 60 * 60 * 1000).toLocaleDateString();
      const endDate = options.endDate || summary.end_date || now.toLocaleDateString();
      
      doc.fontSize(10).fillColor(colors.dark).font('Helvetica').text(`Analysis Period: ${startDate} to ${endDate}`, 40, yPos);
      yPos += 15;
      
      // Add report generation timestamp
      doc.fontSize(8).fillColor(colors.dark).text(`Report generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 40, yPos);
      yPos += 25;
      
      // SUMMARY SECTION
      doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold').text('SUMMARY METRICS', 40, yPos);
      yPos += 20;

      // Summary metrics boxes - attractive visual design
      const metricBoxWidth = 250;
      const metricBoxHeight = 100;
      const metricGap = 15;

      // Top row - Turnover Ratio and DSI
      // Box 1: Turnover Ratio
      drawRect(40, yPos, metricBoxWidth, metricBoxHeight, colors.light);
      doc.strokeColor(colors.borderColor).lineWidth(1).rect(40, yPos, metricBoxWidth, metricBoxHeight).stroke();
      
      // Title bar for Turnover Ratio
      drawRect(40, yPos, metricBoxWidth, 25, colors.primary);
      doc.fillColor(colors.light).font('Helvetica-Bold').fontSize(12).text('Inventory Turnover Ratio', 50, yPos + 6);
      
      // Value with formula
      doc.fillColor(colors.info).font('Helvetica-Bold').fontSize(28).text(
        numberFormatter(summary.overall_turnover_ratio || 0), 
        50, 
        yPos + 40
      );
      
      doc.fillColor(colors.dark).font('Helvetica').fontSize(9).text(
        'COGS ÷ Average Inventory Value', 
        50, 
        yPos + 75
      );

      // Box 2: Days Sales of Inventory (DSI)
      drawRect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, metricBoxHeight, colors.light);
      doc.strokeColor(colors.borderColor).lineWidth(1).rect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, metricBoxHeight).stroke();
      
      // Title bar for DSI
      drawRect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, 25, colors.accent);
      doc.fillColor(colors.light).font('Helvetica-Bold').fontSize(12).text('Days Sales of Inventory (DSI)', 50 + metricBoxWidth + metricGap, yPos + 6);
      
      // Value with explanation
      const dsiValue = Math.round(summary.overall_dsi || 0);
      doc.fillColor(colors.warning).font('Helvetica-Bold').fontSize(28).text(
        `${dsiValue} days`, 
        50 + metricBoxWidth + metricGap, 
        yPos + 40
      );
      
      doc.fillColor(colors.dark).font('Helvetica').fontSize(9).text(
        'Days to sell entire inventory', 
        50 + metricBoxWidth + metricGap, 
        yPos + 75
      );
      
      yPos += metricBoxHeight + metricGap;

      // Bottom row - Inventory Value and COGS
      // Box 3: Inventory Value
      drawRect(40, yPos, metricBoxWidth, metricBoxHeight, colors.light);
      doc.strokeColor(colors.borderColor).lineWidth(1).rect(40, yPos, metricBoxWidth, metricBoxHeight).stroke();
      
      // Title bar
      drawRect(40, yPos, metricBoxWidth, 25, colors.success);
      doc.fillColor(colors.light).font('Helvetica-Bold').fontSize(12).text('Total Inventory Value', 50, yPos + 6);
      
      // Value with explanation
      doc.fillColor(colors.success).font('Helvetica-Bold').fontSize(20).text(
        currencyFormatter(summary.total_inventory_value || 0), 
        50, 
        yPos + 40
      );
      
      doc.fillColor(colors.dark).font('Helvetica').fontSize(9).text(
        'Based on current cost prices', 
        50, 
        yPos + 75
      );

      // Box 4: COGS
      drawRect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, metricBoxHeight, colors.light);
      doc.strokeColor(colors.borderColor).lineWidth(1).rect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, metricBoxHeight).stroke();
      
      // Title bar
      drawRect(40 + metricBoxWidth + metricGap, yPos, metricBoxWidth, 25, colors.secondary);
      doc.fillColor(colors.light).font('Helvetica-Bold').fontSize(12).text('Total COGS (Period)', 50 + metricBoxWidth + metricGap, yPos + 6);
      
      // Value with explanation
      doc.fillColor(colors.secondary).font('Helvetica-Bold').fontSize(20).text(
        currencyFormatter(summary.total_cogs || 0), 
        50 + metricBoxWidth + metricGap, 
        yPos + 40
      );
      
      doc.fillColor(colors.dark).font('Helvetica').fontSize(9).text(
        'From paid orders only', 
        50 + metricBoxWidth + metricGap, 
        yPos + 75
      );
      
      yPos += metricBoxHeight + 30;

      // PRODUCT ANALYSIS
      if (checkNewPage(200)) yPos += 10;
      
      doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold').text('PRODUCT TURNOVER ANALYSIS', 40, yPos);
      yPos += 20;
      
      doc.fontSize(10).fillColor(colors.dark).font('Helvetica').text(
        `This analysis shows inventory turnover performance for ${products.length} products. ` +
        `Higher turnover ratio indicates products are selling quickly, while lower DSI (Days Sales of Inventory) is better.`,
        40, yPos, { width: 515 }
      );
      
      const textHeight = doc.heightOfString(
        `This analysis shows inventory turnover performance for ${products.length} products. ` +
        `Higher turnover ratio indicates products are selling quickly, while lower DSI (Days Sales of Inventory) is better.`,
        { width: 515 }
      );
      
      yPos += textHeight + 15;

      // Products table header
      drawRect(40, yPos, 515, 25, colors.tableHeaderBg);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');

      // Set column positions and widths
      const productColumns = [
        { name: 'PRODUCT', width: 110, align: 'left' },
        { name: 'CATEGORY', width: 80, align: 'left' },
        { name: 'STOCK', width: 45, align: 'right' },
        { name: 'SOLD', width: 35, align: 'right' },
        { name: 'COGS', width: 70, align: 'right' },
        { name: 'TURNOVER', width: 60, align: 'right' },
        { name: 'DSI', width: 50, align: 'right' },
        { name: 'HEALTH', width: 65, align: 'center' }
      ];

      let xPos = 45;
      productColumns.forEach(column => {
        doc.text(column.name, xPos, yPos + 8, { width: column.width, align: column.align });
        xPos += column.width;
      });

      yPos += 25;

      // Products table data
      const topProducts = products
        .sort((a, b) => (parseFloat(b.turnover_ratio) || 0) - (parseFloat(a.turnover_ratio) || 0))
        .slice(0, Math.min(15, products.length));

      doc.font('Helvetica').fontSize(9);
      
      topProducts.forEach((product, index) => {
        // Check if we need a new page
        if (checkNewPage(20)) {
          // Redraw the header on the new page
          drawRect(40, yPos, 515, 25, colors.tableHeaderBg);
          doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
          
          xPos = 45;
          productColumns.forEach(column => {
            doc.text(column.name, xPos, yPos + 8, { width: column.width, align: column.align });
            xPos += column.width;
          });
          
          yPos += 25;
          doc.font('Helvetica').fontSize(9);
        }

        // Draw row background
        const rowColor = index % 2 === 0 ? colors.tableBg1 : colors.tableBg2;
        drawRect(40, yPos, 515, 20, rowColor);
        
        // Fill row data
        doc.fillColor(colors.dark);
        
        xPos = 45;
        
        // Product name
        doc.text(product.Name?.substring(0, 25) || 'N/A', xPos, yPos + 6, { width: productColumns[0].width, align: 'left' });
        xPos += productColumns[0].width;
        
        // Category
        doc.text(product.Category?.substring(0, 15) || 'N/A', xPos, yPos + 6, { width: productColumns[1].width, align: 'left' });
        xPos += productColumns[1].width;
        
        // Current stock
        doc.text(product.current_stock?.toString() || '0', xPos, yPos + 6, { width: productColumns[2].width, align: 'right' });
        xPos += productColumns[2].width;
        
        // Units sold
        doc.text(product.units_sold?.toString() || '0', xPos, yPos + 6, { width: productColumns[3].width, align: 'right' });
        xPos += productColumns[3].width;
        
        // COGS
        doc.text(currencyFormatter(product.cogs || 0), xPos, yPos + 6, { width: productColumns[4].width, align: 'right' });
        xPos += productColumns[4].width;
        
        // Turnover ratio
        const turnoverRatio = parseFloat(product.turnover_ratio) || 0;
        // Set color based on value
        if (turnoverRatio > 3) doc.fillColor(colors.success);
        else if (turnoverRatio > 1.5) doc.fillColor(colors.info);
        else if (turnoverRatio > 0.5) doc.fillColor(colors.warning);
        else doc.fillColor(colors.danger);
        
        doc.text(numberFormatter(turnoverRatio), xPos, yPos + 6, { width: productColumns[5].width, align: 'right' });
        xPos += productColumns[5].width;
        
        // DSI - Use the value from the data, don't recalculate
        const dsi = product.dsi ? Math.round(parseFloat(product.dsi)) : 'N/A';
        
        // Color based on DSI
        if (dsi < 60) doc.fillColor(colors.success);
        else if (dsi < 120) doc.fillColor(colors.info);
        else if (dsi < 180) doc.fillColor(colors.warning);
        else doc.fillColor(colors.danger);
        
        doc.text(dsi.toString(), xPos, yPos + 6, { width: productColumns[6].width, align: 'right' });
        xPos += productColumns[6].width;
        
        // Health status
        let healthColor;
        switch(product.inventory_health?.toLowerCase() || 'unknown') {
          case 'fast-moving': healthColor = colors.success; break;
          case 'healthy': healthColor = colors.info; break;
          case 'slow-moving': healthColor = colors.warning; break;
          case 'stagnant': healthColor = colors.danger; break;
          default: healthColor = colors.dark;
        }
        
        doc.fillColor(healthColor);
        doc.text(product.inventory_health || 'Unknown', xPos, yPos + 6, { width: productColumns[7].width, align: 'center' });
        
        // Reset text color
        doc.fillColor(colors.dark);
        
        yPos += 20;
      });
      
      yPos += 10;
      
      // CATEGORY ANALYSIS
      if (categories.length > 0) {
        if (checkNewPage(80)) yPos += 10;
        
        doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold').text('CATEGORY TURNOVER ANALYSIS', 40, yPos);
        yPos += 25;
        
        // Categories table header
        drawRect(40, yPos, 515, 25, colors.tableHeaderBg);
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');

        // Set column positions and widths
        const categoryColumns = [
          { name: 'CATEGORY', width: 110, align: 'left' },
          { name: 'PRODUCTS', width: 65, align: 'center' },
          { name: 'VALUE', width: 85, align: 'right' },
          { name: 'UNITS SOLD', width: 75, align: 'right' },
          { name: 'COGS', width: 85, align: 'right' },
          { name: 'TURNOVER', width: 50, align: 'right' },
          { name: 'DSI', width: 45, align: 'right' }
        ];

        xPos = 45;
        categoryColumns.forEach(column => {
          doc.text(column.name, xPos, yPos + 8, { width: column.width, align: column.align });
          xPos += column.width;
        });

        yPos += 25;
        doc.font('Helvetica').fontSize(9);

        // Categories table data
        const sortedCategories = categories
          .sort((a, b) => (parseFloat(b.category_turnover_ratio) || 0) - (parseFloat(a.category_turnover_ratio) || 0));

        sortedCategories.forEach((category, index) => {
          // Check if we need a new page
          if (checkNewPage(20)) {
            // Redraw the header on the new page
            drawRect(40, yPos, 515, 25, colors.tableHeaderBg);
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
            
            xPos = 45;
            categoryColumns.forEach(column => {
              doc.text(column.name, xPos, yPos + 8, { width: column.width, align: column.align });
              xPos += column.width;
            });
            
            yPos += 25;
            doc.font('Helvetica').fontSize(9);
          }

          // Draw row background
          const rowColor = index % 2 === 0 ? colors.tableBg1 : colors.tableBg2;
          drawRect(40, yPos, 515, 20, rowColor);
          
          // Fill row data
          doc.fillColor(colors.dark);
          
          xPos = 45;
          
          // Category name
          doc.text(category.Category?.substring(0, 25) || 'N/A', xPos, yPos + 6, { width: categoryColumns[0].width, align: 'left' });
          xPos += categoryColumns[0].width;
          
          // Product count
          doc.text(category.product_count?.toString() || '0', xPos, yPos + 6, { width: categoryColumns[1].width, align: 'center' });
          xPos += categoryColumns[1].width;
          
          // Inventory value
          doc.text(currencyFormatter(category.total_inventory_value || 0), xPos, yPos + 6, { width: categoryColumns[2].width, align: 'right' });
          xPos += categoryColumns[2].width;
          
          // Units sold
          doc.text(category.total_units_sold?.toString() || '0', xPos, yPos + 6, { width: categoryColumns[3].width, align: 'right' });
          xPos += categoryColumns[3].width;
          
          // COGS
          doc.text(currencyFormatter(category.total_cogs || 0), xPos, yPos + 6, { width: categoryColumns[4].width, align: 'right' });
          xPos += categoryColumns[4].width;
          
          // Turnover ratio
          const catTurnoverRatio = parseFloat(category.category_turnover_ratio) || 0;
          
          // Color based on value
          if (catTurnoverRatio > 3) doc.fillColor(colors.success);
          else if (catTurnoverRatio > 1.5) doc.fillColor(colors.info);
          else if (catTurnoverRatio > 0.5) doc.fillColor(colors.warning);
          else doc.fillColor(colors.danger);
          
          doc.text(numberFormatter(catTurnoverRatio), xPos, yPos + 6, { width: categoryColumns[5].width, align: 'right' });
          xPos += categoryColumns[5].width;
          
          // DSI - Use the value from the data, don't recalculate
          const catDsi = category.dsi ? Math.round(parseFloat(category.dsi)) : 'N/A';
          
          // Color based on DSI
          if (catDsi < 60) doc.fillColor(colors.success);
          else if (catDsi < 120) doc.fillColor(colors.info);
          else if (catDsi < 180) doc.fillColor(colors.warning);
          else doc.fillColor(colors.danger);
          
          doc.text(catDsi.toString(), xPos, yPos + 6, { width: categoryColumns[6].width, align: 'right' });
          
          // Reset color
          doc.fillColor(colors.dark);
          
          yPos += 20;
        });
        
        yPos += 10;
      }

      // RECOMMENDATIONS
      if (checkNewPage(100)) yPos += 10;
      
      // Identify slow-moving items that need attention
      const slowMovingItems = products
        .filter(p => parseFloat(p.turnover_ratio) < 0.5 && parseInt(p.current_stock) > 0)
        .sort((a, b) => (parseInt(b.current_stock) * parseFloat(b.unit_cost)) - (parseInt(a.current_stock) * parseFloat(a.unit_cost)))
        .slice(0, 5);
      
      if (slowMovingItems.length > 0) {
        // Add a recommendations section
        drawRect(40, yPos, 515, 30, colors.warning);
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('RECOMMENDATIONS', 50, yPos + 8);
        yPos += 40;
        
        doc.fillColor(colors.danger).fontSize(12).font('Helvetica-Bold')
          .text('Slow-Moving Items - Consider reducing stock or promotions', 40, yPos);
        yPos += 15;
        
        doc.fillColor(colors.dark).fontSize(10).font('Helvetica');
        
        slowMovingItems.forEach(item => {
          doc.text(
            `• ${item.Name} - Turnover: ${numberFormatter(item.turnover_ratio)}, Current Stock: ${item.current_stock}`,
            60, yPos, { width: 495 }
          );
          yPos += 15;
        });
      }

      // FOOTER
      // Draw on each page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Footer line
        drawLine(doc.page.height - 40, colors.primary, 1);
        
        // Footer text
        doc.fontSize(8).fillColor(colors.dark).font('Helvetica');
        doc.text('© Calton Hill Hardware. Inventory Turnover Report.', 40, doc.page.height - 25);
        
        // Page number
        doc.text(`Page ${i + 1} of ${pageCount}`, 500, doc.page.height - 25, { align: 'right' });
      }

      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

module.exports = { 
  createPurchaseOrderPdf, 
  createStockMovementPdf,
  createInventoryTurnoverPdf
};