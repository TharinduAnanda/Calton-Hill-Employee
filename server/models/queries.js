// Auth queries
const authQueries = {
  findEmployeeByEmail: 'SELECT * FROM staff WHERE Email = ?',
  createEmployee: 'INSERT INTO staff (First_Name, Last_Name, Email, Phone_Number, Address, Password, Age, Gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
};

// Inventory queries
const inventoryQueries = {
  getAllInventory: `
    SELECT i.Inventory_ID, i.Stock_Level, i.Last_Updated, 
           p.Product_ID, p.Name as ProductName, p.Category, p.Manufacturer, p.Price,
           s.Supplier_ID, s.Name as SupplierName
    FROM inventory i
    JOIN product p ON i.Product_ID = p.Product_ID
    LEFT JOIN supplier s ON i.Supplier_ID = s.Supplier_ID
  `,
  getInventoryById: `
    SELECT i.Inventory_ID, i.Stock_Level, i.Last_Updated, 
           p.Product_ID, p.Name as ProductName, p.Category, p.Manufacturer, p.Price,
           s.Supplier_ID, s.Name as SupplierName
    FROM inventory i
    JOIN product p ON i.Product_ID = p.Product_ID
    LEFT JOIN supplier s ON i.Supplier_ID = s.Supplier_ID
    WHERE i.Inventory_ID = ?
  `,
  createInventory: 'INSERT INTO inventory (Stock_Level, Product_ID, Supplier_ID) VALUES (?, ?, ?)',
  updateInventory: 'UPDATE inventory SET Stock_Level = ?, Supplier_ID = ? WHERE Inventory_ID = ?',
  deleteInventory: 'DELETE FROM inventory WHERE Inventory_ID = ?'
};

// Product queries
const productQueries = {
  getAllProducts: 'SELECT * FROM product',
  getProductById: 'SELECT * FROM product WHERE Product_ID = ?',
  createProduct: 'INSERT INTO product (Name, Category, Stock_Level, Manufacturer, Image_URL, Supplier_ID, Price, image_public_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  updateProduct: 'UPDATE product SET Name = ?, Category = ?, Stock_Level = ?, Manufacturer = ?, Image_URL = ?, Supplier_ID = ?, Price = ? WHERE Product_ID = ?',
  deleteProduct: 'DELETE FROM product WHERE Product_ID = ?',
  searchProducts: 'SELECT * FROM product WHERE Name LIKE ? OR Category LIKE ? OR Manufacturer LIKE ?'
};

// Supplier queries
const supplierQueries = {
  getAllSuppliers: 'SELECT * FROM supplier',
  getSupplierById: 'SELECT * FROM supplier WHERE Supplier_ID = ?',
  createSupplier: 'INSERT INTO supplier (Name, Email, Phone_Number) VALUES (?, ?, ?)',
  updateSupplier: 'UPDATE supplier SET Name = ?, Email = ?, Phone_Number = ? WHERE Supplier_ID = ?',
  deleteSupplier: 'DELETE FROM supplier WHERE Supplier_ID = ?'
};

// Order queries
const orderQueries = {
  getAllOrders: `
    SELECT co.*, c.NAME as CustomerName, c.EMAIL as CustomerEmail, c.PHONE_NUM as CustomerPhone
    FROM customerorder co
    JOIN customer c ON co.Customer_ID = c.ID
  `,
  getOrderById: `
    SELECT co.*, c.NAME as CustomerName, c.EMAIL as CustomerEmail, c.PHONE_NUM as CustomerPhone
    FROM customerorder co
    JOIN customer c ON co.Customer_ID = c.ID
    WHERE co.Order_ID = ?
  `,
  getOrderItems: `
    SELECT oi.*, p.Name as ProductName, p.Price, p.Category
    FROM order_item oi
    JOIN product p ON oi.Product_ID = p.Product_ID
    WHERE oi.Order_ID = ?
  `,
  updateOrderStatus: 'UPDATE customerorder SET Payment_Status = ?, Delivery_Status = ? WHERE Order_ID = ?'
};

module.exports = {
  authQueries,
  inventoryQueries,
  productQueries,
  supplierQueries,
  orderQueries
};