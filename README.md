# Order Management System

This is a comprehensive order management system for handling customer orders, payments, and delivery tracking.

## Features

### Manager Order Dashboard
- View order statistics with charts and graphs
- Filter orders by various criteria (payment status, delivery status, date range, etc.)
- Update order payment details
- Change order delivery status
- Assign staff to orders
- View detailed order information

### Order Processing
- Create new orders
- Update order status
- View order details and items
- Track delivery status
- Manage payment information

## Database Structure

### Customer Order Table
```
Order_ID (Primary Key, int, AUTO_INCREMENT)
Order_Date (datetime, Index)
Total_Amount (decimal(10,2))
Payment_Status (varchar(50))
payment_reference (varchar(255))
payment_method (varchar(50))
Delivery_Address (text)
Delivery_Status (varchar(50), Index)
Customer_ID (int, Index)
Staff_ID (int, Index)
source (varchar(50))
```

### Order Item Table
```
Order_Item_ID (Primary Key, int, AUTO_INCREMENT)
Order_ID (Foreign Key)
Product_ID (Foreign Key)
Quantity (int)
Price (decimal(10,2))
```

## API Endpoints

### Order Routes
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID with items
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status

### Manager-specific Routes
- `GET /api/orders/manager/stats` - Get manager order statistics
- `GET /api/orders/manager/filtered` - Get filtered orders
- `PUT /api/orders/:id/payment` - Update order payment details
- `PUT /api/orders/:id/assign-staff` - Assign staff to order

## Frontend Components

### Pages
- `OrdersPage` - List of orders with filtering options
- `OrderDetail` - Detailed view of a single order
- `ManagerOrdersPage` - Advanced order management for managers

### Components
- `OrderList` - Reusable component for displaying orders
- `ManagerOrderStats` - Charts and statistics for managers

## Getting Started

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

3. Access the order management system:
```
http://localhost:3000/manager/orders
```

## Dependencies

- React
- Material-UI
- Chart.js
- React Router
- Axios
- Date-fns

## License

This project is licensed under the MIT License. 