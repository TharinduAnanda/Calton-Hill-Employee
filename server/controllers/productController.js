const { executeQuery, pool } = require('../config/db');
const { productQueries } = require('../models/queries');

// Add this helper function at the top of the file
const getImageDetails = (imageData) => {
  // If imageData is an object with url and public_id properties (from Cloudinary)
  if (imageData && typeof imageData === 'object' && imageData.url && imageData.public_id) {
    return {
      image_url: imageData.url,
      image_public_id: imageData.public_id
    };
  }
  
  // If imageData is a string, assume it's a URL and generate a placeholder public_id
  if (imageData && typeof imageData === 'string') {
    return {
      image_url: imageData,
      image_public_id: `auto_generated_${Date.now()}`
    };
  }
  
  // Default return empty values
  return {
    image_url: null,
    image_public_id: `placeholder_${Date.now()}`
  };
};

// Update this utility function near the top of the file
const normalizeProductData = (product) => {
  if (!product) return {};
  
  // First spread all original properties
  return {
    ...product,
    // Then override with normalized field names
    Product_ID: product.Product_ID || product.product_id,
    Name: product.Name || product.name || '',
    SKU: product.SKU || product.sku || '',
    Description: product.Description || product.description || '',
    Category: product.Category || product.category || '',
    Subcategory: product.Subcategory || product.subcategory || '',
    Price: product.Price || product.price || 0,
    Stock_Level: product.Stock_Level || product.stock_level || 0,
    Manufacturer: product.Manufacturer || product.manufacturer || '',
    Brand: product.Brand || product.brand || '',
    Image_URL: product.Image_URL || product.image_url || '',
    Supplier_ID: product.Supplier_ID || product.supplier_id,
    Status: product.Status || product.status || 'active'
  };
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await executeQuery(productQueries.getAllProducts);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Use stored procedure to get product details
    const products = await executeQuery('CALL GetProductDetailsById(?)', [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    console.log("Product creation request body:", req.body);

    const { 
      name, 
      sku,
      description, 
      category,
      category_id,
      subcategory,
      subcategory_id, 
      manufacturer,
      brand,
      cost_price,
      image_url, 
      supplier_id, 
      price,
      image_public_id,
      
      // Additional fields
      unit_of_measure,
      discount_percentage,
      tax_percentage,
      specifications,
      weight,
      length,
      width,
      height,
      material_type,
      thickness,
      color_options,
      voltage,
      power_source,
      coverage_area,
      finish_type,
      certification_info,
      warranty_period,
      expiry_date,
      lead_time
    } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Create a placeholder for image_public_id if not provided
    const placeholderImageId = 'temp_image_id_' + Date.now();
    const safeImagePublicId = image_public_id || placeholderImageId;

    // Convert numeric values safely
    const safeCostPrice = cost_price === null || isNaN(cost_price) ? null : parseFloat(cost_price);
    const safePrice = isNaN(price) ? 0 : parseFloat(price);
    // Remove stock_level conversion as it should only go to inventory table
    const safeDiscountPercentage = discount_percentage === null || isNaN(discount_percentage) ? null : parseFloat(discount_percentage);
    const safeTaxPercentage = tax_percentage === null || isNaN(tax_percentage) ? null : parseFloat(tax_percentage);
    const safeWeight = weight === null || isNaN(weight) ? null : parseFloat(weight);
    const safeLength = length === null || isNaN(length) ? null : parseFloat(length);
    const safeWidth = width === null || isNaN(width) ? null : parseFloat(width);
    const safeHeight = height === null || isNaN(height) ? null : parseFloat(height);
    const safeThickness = thickness === null || isNaN(thickness) ? null : parseFloat(thickness);
    const safeWarrantyPeriod = warranty_period === null || isNaN(warranty_period) ? null : parseInt(warranty_period);
    const safeLeadTime = lead_time === null || isNaN(lead_time) ? null : parseInt(lead_time);

    // Handle category name with proper fallbacks
    let categoryName = '';

    // First try to use the category from the request
    if (category) {
      categoryName = category;
    }
    // Then try to use category_id to look up the name
    else if (category_id) {
      try {
        const categoryResult = await executeQuery('SELECT name FROM product_categories WHERE id = ?', [category_id]);
        if (categoryResult && categoryResult.length > 0) {
          categoryName = categoryResult[0].name;
        } else {
          categoryName = category_id; // Use ID as name if lookup fails
        }
      } catch (error) {
        console.error('Error looking up category:', error);
        categoryName = category_id; // Fallback to ID
      }
    }
    // Finally, fall back to existing category if available
    else {
      categoryName = ''; // Default to empty string if no category information is available
      console.log('No category information available, using empty string');
    }
    
    // Add this right before the INSERT executeQuery:
    console.log("SQL Parameters for product creation:", [
      name, 
      sku || '', 
      description || '', 
      categoryName,
      subcategory || '',
      subcategory_id || null,
      brand || '',
      manufacturer || '',
      safeCostPrice,
      safePrice, 
      image_url || '', 
      safeImagePublicId, 
      'active', 
      supplier_id || null,
      unit_of_measure || null,
      safeDiscountPercentage,
      safeTaxPercentage,
      specifications || null,
      safeWeight,
      safeLength,
      safeWidth,
      safeHeight,
      material_type || null,
      safeThickness,
      color_options || null,
      voltage || null,
      power_source || null,
      coverage_area || null,
      finish_type || null,
      certification_info || null,
      safeWarrantyPeriod,
      expiry_date || null,
      safeLeadTime
    ]);

    // Then the original executeQuery call follows
    const result = await executeQuery(
      `INSERT INTO product (
        Name, 
        SKU, 
        Description, 
        Category,
        Subcategory,
        subcategory_id,
        Brand,
        Manufacturer, 
        Cost_Price,
        Price, 
        Image_URL, 
        Image_Public_ID, 
        Status, 
        Supplier_ID,
        unit_of_measure,
        discount_percentage,
        tax_percentage,
        specifications,
        weight,
        length,
        width,
        height,
        material_type,
        thickness,
        color_options,
        voltage,
        power_source,
        coverage_area,
        finish_type,
        certification_info,
        warranty_period,
        expiry_date,
        lead_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        name, 
        sku || '', 
        description || '', 
        categoryName || '',
        subcategory || '',
        subcategory_id || null,
        brand || '',
        manufacturer || '',
        safeCostPrice,
        safePrice, 
        image_url || '', 
        safeImagePublicId || 'placeholder', 
        'active', 
        supplier_id !== undefined && supplier_id !== '' ? parseInt(supplier_id) : null,
        unit_of_measure || '',
        safeDiscountPercentage,
        safeTaxPercentage,
        specifications || '',
        safeWeight,
        safeLength,
        safeWidth,
        safeHeight,
        material_type || '',
        safeThickness,
        color_options || '',
        voltage || '',
        power_source || '',
        coverage_area || '',
        finish_type || '',
        certification_info || '',
        safeWarrantyPeriod,
        expiry_date || null,
        safeLeadTime
      ]
    );

    res.status(201).json({ 
      message: 'Product created successfully',
      product_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log(`Received update request for product ID: ${productId}`);
    
    // Verify that the productId is valid
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Extract all fields from request body
    const { 
      name, 
      description, 
      sku, 
      category,
      category_id,
      subcategory,
      subcategory_id,
      manufacturer, 
      brand, 
      cost_price,
      image_url, 
      supplier_id, 
      price,
      image_public_id,
      status,
      // Additional fields
      unit_of_measure,
      discount_percentage,
      tax_percentage,
      specifications,
      weight,
      length,
      width,
      height,
      material_type,
      thickness,
      color_options,
      voltage,
      power_source,
      coverage_area,
      finish_type,
      certification_info,
      warranty_period,
      expiry_date,
      lead_time,
      // Inventory fields - we'll handle these separately
      stock_level,
      reorder_level,
      optimal_level,
      bin_location,
      warehouse_zone,
      inventory_value_method,
      reorder_quantity,
      storage_location,
      inventory_unit_measure
    } = req.body;
    
    // Check if product exists - Using executeQuery instead of direct pool access
    const rows = await executeQuery(
      'SELECT * FROM product WHERE Product_ID = ?', 
      [productId]
    );
    
    console.log('Database query result rows:', rows);
    
    // Handle case when product doesn't exist or no rows returned
    if (!rows || rows.length === 0) {
      console.log(`Product with ID ${productId} not found in database`);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get product data from result
    const existingProduct = rows[0];
    
    // Make sure we actually got a product
    if (!existingProduct) {
      console.log(`Product data is empty for ID ${productId}`);
      return res.status(404).json({ message: 'Product data is empty' });
    }
    
    console.log('Found existing product:', existingProduct);
    
    // Normalize the product data to ensure consistent property access
    const productData = normalizeProductData(existingProduct);
    
    // Add debugging to help troubleshoot
    console.log('Product data after normalization:', productData);
    
    // Handle category name with proper fallbacks
    let categoryName = '';

    // First try to use the category from the request
    if (category) {
      categoryName = category;
    }
    // Then try to use category_id to look up the name
    else if (category_id) {
      try {
        const categoryRows = await executeQuery(
          'SELECT name FROM product_categories WHERE id = ?', 
          [category_id]
        );
        
        if (categoryRows && categoryRows.length > 0) {
          categoryName = categoryRows[0].name;
        } else {
          categoryName = category_id; // Use ID as name if lookup fails
        }
      } catch (error) {
        console.error('Error looking up category:', error);
        categoryName = category_id; // Fallback to ID
      }
    }
    // Finally, fall back to existing category if available
    else if (productData && typeof productData === 'object') {
      // Safely access the Category property with fallbacks
      categoryName = productData.Category || '';
    }
    
    // Helper function to safely parse numeric values and convert NaN to null
    const safeNumber = (value, defaultValue = null) => {
      if (value === undefined || value === '' || value === null) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    // Prepare all the values for the UPDATE query
    const values = [
      name || (productData ? productData.Name : '') || '', 
      description || (productData ? productData.Description : '') || '', 
      sku || (productData ? productData.SKU : '') || '', 
      categoryName || '',
      subcategory || (productData ? productData.Subcategory : '') || '', 
      subcategory_id || (productData ? productData.subcategory_id : null),
      manufacturer || (productData ? productData.Manufacturer : '') || '',
      brand || (productData ? productData.Brand : '') || '',
      safeNumber(cost_price, productData?.cost_price),
      image_url || (productData ? productData.Image_URL : '') || '', 
      supplier_id !== undefined ? supplier_id : (productData ? productData.Supplier_ID : null), 
      safeNumber(price, productData?.Price || 0),
      image_public_id || (productData ? productData.image_public_id : '') || '',
      status || (productData ? productData.Status : '') || 'active',
      unit_of_measure || (productData ? productData.unit_of_measure : null),
      safeNumber(discount_percentage, productData?.discount_percentage),
      safeNumber(tax_percentage, productData?.tax_percentage),
      specifications || (productData ? productData.specifications : null),
      safeNumber(weight, productData?.weight),
      safeNumber(length, productData?.length),
      safeNumber(width, productData?.width),
      safeNumber(height, productData?.height),
      material_type || (productData ? productData.material_type : null),
      safeNumber(thickness, productData?.thickness),
      color_options || (productData ? productData.color_options : null),
      voltage || (productData ? productData.voltage : null),
      power_source || (productData ? productData.power_source : null),
      coverage_area || (productData ? productData.coverage_area : null),
      finish_type || (productData ? productData.finish_type : null),
      certification_info || (productData ? productData.certification_info : null),
      safeNumber(warranty_period, productData?.warranty_period),
      expiry_date || (productData ? productData.expiry_date : null),
      safeNumber(lead_time, productData?.lead_time),
      productId
    ];
    
    // Debug the values to make sure there are no NaN values
    console.log('Safe values to be used in query:', values);
    
    // Update query - Use executeQuery 
    const result = await executeQuery(
      `UPDATE product SET 
        Name = ?, 
        Description = ?, 
        SKU = ?, 
        Category = ?, 
        Subcategory = ?, 
        subcategory_id = ?, 
        Manufacturer = ?, 
        Brand = ?, 
        cost_price = ?, 
        Image_URL = ?, 
        Supplier_ID = ?, 
        Price = ?, 
        image_public_id = ?,
        Status = ?,
        unit_of_measure = ?,
        discount_percentage = ?,
        tax_percentage = ?,
        specifications = ?,
        weight = ?,
        length = ?,
        width = ?,
        height = ?,
        material_type = ?,
        thickness = ?,
        color_options = ?,
        voltage = ?,
        power_source = ?,
        coverage_area = ?,
        finish_type = ?,
        certification_info = ?,
        warranty_period = ?,
        expiry_date = ?,
        lead_time = ?
      WHERE Product_ID = ?`,
      values
    );
    
    console.log('Update query result:', result);
    
    // Now handle inventory update separately if inventory fields are provided
    if (stock_level !== undefined || reorder_level !== undefined || optimal_level !== undefined ||
        bin_location !== undefined || warehouse_zone !== undefined || inventory_value_method !== undefined ||
        reorder_quantity !== undefined || storage_location !== undefined || inventory_unit_measure !== undefined) {
      
      // First check if inventory record exists
      const inventoryResult = await executeQuery(
        'SELECT * FROM inventory WHERE Product_ID = ?',
        [productId]
      );
      
      if (inventoryResult && inventoryResult.length > 0) {
        // Inventory record exists, update it
        const inventoryValues = [];
        let inventoryQuery = 'UPDATE inventory SET ';
        let setClauses = [];
        
        if (stock_level !== undefined) {
          setClauses.push('Stock_Level = ?');
          inventoryValues.push(parseInt(stock_level));
        }
        
        if (reorder_level !== undefined) {
          setClauses.push('reorder_level = ?');
          inventoryValues.push(parseInt(reorder_level));
        }
        
        if (optimal_level !== undefined) {
          setClauses.push('optimal_level = ?');
          inventoryValues.push(parseInt(optimal_level));
        }
        
        if (bin_location !== undefined) {
          setClauses.push('bin_location = ?');
          inventoryValues.push(bin_location);
        }
        
        if (warehouse_zone !== undefined) {
          setClauses.push('warehouse_zone = ?');
          inventoryValues.push(warehouse_zone);
        }
        
        if (inventory_value_method !== undefined) {
          setClauses.push('inventory_value_method = ?');
          inventoryValues.push(inventory_value_method);
        }
        
        if (reorder_quantity !== undefined) {
          setClauses.push('reorder_quantity = ?');
          inventoryValues.push(parseInt(reorder_quantity));
        }
        
        if (storage_location !== undefined) {
          setClauses.push('storage_location = ?');
          inventoryValues.push(storage_location);
        }
        
        if (inventory_unit_measure !== undefined) {
          setClauses.push('unit_of_measure = ?');
          inventoryValues.push(inventory_unit_measure);
        }
        
        if (setClauses.length > 0) {
          inventoryQuery += setClauses.join(', ') + ' WHERE Product_ID = ?';
          inventoryValues.push(productId);
          
          await executeQuery(inventoryQuery, inventoryValues);
          console.log('Inventory record updated');
        }
      } else {
        // Inventory record doesn't exist, create it
        await executeQuery(
          `INSERT INTO inventory (
            Product_ID, 
            Stock_Level, 
            reorder_level, 
            optimal_level, 
            bin_location, 
            warehouse_zone, 
            inventory_value_method, 
            reorder_quantity, 
            storage_location, 
            unit_of_measure
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            stock_level !== undefined ? parseInt(stock_level) : 0,
            reorder_level !== undefined ? parseInt(reorder_level) : 10,
            optimal_level !== undefined ? parseInt(optimal_level) : 50,
            bin_location || null,
            warehouse_zone || null,
            inventory_value_method || 'FIFO',
            reorder_quantity !== undefined ? parseInt(reorder_quantity) : 0,
            storage_location || null,
            inventory_unit_measure || null
          ]
        );
        console.log('New inventory record created');
      }
    }
    
    // Respond with the updated product data
    res.status(200).json({
      message: 'Product updated successfully',
      product_id: productId
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const products = await executeQuery(
      productQueries.getProductById,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const result = await executeQuery(
      productQueries.deleteProduct,
      [productId]
    );
    
    if (result.affectedRows === 1) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const searchTerm = `%${query}%`;
    
    const products = await executeQuery(
      productQueries.searchProducts,
      [searchTerm, searchTerm, searchTerm]
    );
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).json({ message: 'Error searching products' });
  }
};

// Get suppliers for a specific product
const getProductSuppliers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get all suppliers who provide this product
    const suppliers = await executeQuery(
      `SELECT s.* FROM supplier s
       JOIN supplier_product sp ON s.Supplier_ID = sp.supplier_id
       WHERE sp.product_id = ?`,
      [id]
    );
    
    res.status(200).json(suppliers);
  } catch (error) {
    console.error(`Error fetching suppliers for product #${req.params.id}:`, error);
    res.status(500).json({
      message: `Failed to retrieve suppliers for product`,
      error: error.message
    });
  }
};

// Get product categories
const getProductCategories = async (req, res) => {
  try {
    const query = `
      SELECT * FROM product_categories
      ORDER BY name ASC
    `;
    
    const categories = await executeQuery(query);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching product categories:', error.message);
    res.status(500).json({ 
      message: 'Failed to retrieve product categories',
      error: error.message
    });
  }
};

// Get subcategories for a specific category
const getSubcategories = async (req, res) => {
  try {
    const categoryId = req.params.category_id;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }
    
    console.log(`Fetching subcategories for category ID: ${categoryId}`);
    
    const query = `
      SELECT id, name, category_id, created_at
      FROM product_subcategories
      WHERE category_id = ?
      ORDER BY name ASC
    `;
    
    const subcategories = await executeQuery(query, [categoryId]);
    
    // Return subcategories array directly to match client expectations
    res.status(200).json(subcategories);
  } catch (error) {
    console.error(`Error fetching subcategories for category ${req.params.category_id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: error.message
    });
  }
};

// Export all controllers
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductSuppliers,
  getProductCategories,
  getSubcategories
};