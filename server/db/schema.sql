-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT NOT NULL AUTO_INCREMENT,
  po_number VARCHAR(50) NOT NULL UNIQUE,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expected_delivery_date DATETIME NULL,
  supplier_id INT NULL,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  shipping_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  status ENUM('draft', 'pending', 'sent', 'confirmed', 'canceled') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_by INT NULL,
  created_by_name VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sent_date DATETIME NULL,
  sent_to VARCHAR(100) NULL,
  confirmed_date DATETIME NULL,
  received_date DATETIME NULL,
  payment_terms VARCHAR(100) NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (supplier_id) REFERENCES supplier(Supplier_ID) ON DELETE SET NULL,
  INDEX idx_po_number (po_number),
  INDEX idx_status (status),
  INDEX idx_supplier (supplier_id),
  INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT NOT NULL AUTO_INCREMENT,
  purchase_order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NULL,
  description TEXT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(Product_ID) ON DELETE SET NULL,
  INDEX idx_purchase_order (purchase_order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 