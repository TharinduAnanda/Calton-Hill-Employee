-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2025 at 10:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `EMAIL` varchar(100) DEFAULT NULL,
  `PHONE_NUM` varchar(15) DEFAULT NULL,
  `PASSWORD` varchar(255) DEFAULT NULL,
  `resetToken` varchar(100) DEFAULT NULL,
  `resetTokenExpiry` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `birthdate` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER','PREFER_NOT_SAY') DEFAULT 'PREFER_NOT_SAY',
  `loyalty_points` int(11) DEFAULT 0,
  `customer_since` date DEFAULT current_timestamp(),
  `last_purchase_date` date DEFAULT NULL,
  `total_spent` decimal(15,2) DEFAULT 0.00,
  `customer_segment` varchar(50) DEFAULT 'GENERAL',
  `notes` text DEFAULT NULL,
  `marketing_consent` tinyint(1) DEFAULT 0,
  `ADDRESS` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`ID`, `NAME`, `EMAIL`, `PHONE_NUM`, `PASSWORD`, `resetToken`, `resetTokenExpiry`, `createdAt`, `updatedAt`, `birthdate`, `gender`, `loyalty_points`, `customer_since`, `last_purchase_date`, `total_spent`, `customer_segment`, `notes`, `marketing_consent`, `ADDRESS`) VALUES
(1, 'Tharindu Lalanath Ananda', 'tharindulalanath49@gmail.com', '1234567890', '$2b$10$0IYi9qJj0gVI0VToI5p7sewUSZV0Wekq2pVCRScNc7M7uUrAOcK6e', NULL, NULL, '2025-02-25 23:52:37', '2025-02-25 23:52:37', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(2, 'Manel Ananda', 'manel@gmail.com', '0712128692', '$2b$10$ppudb7f1S5V4Ztnpb4QZWeEfJdGx.sxqhpgKTe2v4Y76Rd31gauMy', NULL, NULL, '2025-03-04 21:48:13', '2025-03-04 21:48:13', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(3, 'Kanishka Ananda', 'anandae-im21040@stu.kln.ac.lk', '0717577400', '$2b$10$1B7fTOK/NeDowX/syrZfPuhxhuhvZAvFEENBgIO0OUVmjEmzCrpnm', NULL, NULL, '2025-03-19 07:11:04', '2025-03-19 07:11:04', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(4, 'Lakshitha Sampath', 'lakshitha@gmail.com', '0717577400', '$2b$10$yE1w9NXTu.lBgR7UJOdok.g7d3LvX5CcPqCdCFGE/8uo/DFx1ozEu', NULL, NULL, '2025-03-25 11:46:38', '2025-03-25 11:46:38', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(5, 'dhanuka Wimalarathana', 'dhanuka@gmail.com', '0717577400', '$2b$10$KxqeGQUVird4Bjn1fbo5XuFzHeYRBvJ731f.60MfpuwPmqfyCRuaa', NULL, NULL, '2025-03-25 11:47:47', '2025-03-25 11:47:47', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(6, 'Test User', 'test@example.com', '1234567890', '$2b$10$9zRuSHe5PbxNEpcQsRhZi.HSF3n/m6LTvJWtDxBSDVAQbMLyXKfOq', NULL, NULL, '2025-03-26 01:08:10', '2025-03-26 01:08:10', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL),
(7, 'kanishka dilhan', 'dilhan@gmail.com', NULL, '$2b$10$OHUKUH/2Rw02kwN.CiMege7A3DCBHvQFopJGDbtq8M32rrcqKi1ne', NULL, NULL, '2025-03-26 01:12:44', '2025-03-26 01:12:44', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customerorder`
--

CREATE TABLE `customerorder` (
  `Order_ID` int(11) NOT NULL,
  `Order_Date` datetime DEFAULT current_timestamp(),
  `Total_Amount` decimal(10,2) DEFAULT NULL,
  `Payment_Status` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `Delivery_Address` text DEFAULT NULL,
  `Delivery_Status` varchar(50) DEFAULT NULL,
  `Customer_ID` int(11) DEFAULT NULL,
  `Staff_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerorder`
--

INSERT INTO `customerorder` (`Order_ID`, `Order_Date`, `Total_Amount`, `Payment_Status`, `payment_reference`, `payment_method`, `Delivery_Address`, `Delivery_Status`, `Customer_ID`, `Staff_ID`) VALUES
(1, '2024-03-15 00:00:00', 259.98, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL),
(2, '2024-03-20 00:00:00', 199.99, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL),
(3, '2024-03-22 00:00:00', 139.98, 'paid', NULL, NULL, NULL, 'shipped', 7, NULL),
(7, NULL, 49295.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL),
(8, NULL, 49295.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL),
(9, NULL, 13495.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL),
(10, NULL, 16789.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL),
(12, NULL, 41496.00, 'paid', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL),
(13, '2025-04-26 03:02:21', 43295.00, 'pending', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL),
(14, '2025-05-01 13:37:30', 2299.00, 'pending', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_segment`
--

CREATE TABLE `customer_segment` (
  `segment_id` int(11) NOT NULL,
  `segment_name` varchar(100) NOT NULL,
  `segment_description` text DEFAULT NULL,
  `segment_criteria` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `Expense_ID` int(11) NOT NULL,
  `Expense_Date` date DEFAULT NULL,
  `Expense_Category` varchar(100) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `Receipt_URL` varchar(255) DEFAULT NULL,
  `Store_Manager_ID` int(11) DEFAULT NULL,
  `Owner_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_category`
--

CREATE TABLE `expense_category` (
  `Expense_Category_ID` int(11) NOT NULL,
  `Category_Name` varchar(100) NOT NULL,
  `Category_Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_payment`
--

CREATE TABLE `expense_payment` (
  `Expense_Payment_ID` int(11) NOT NULL,
  `Payment_Date` date DEFAULT NULL,
  `Payment_Amount` decimal(10,2) DEFAULT NULL,
  `Payment_Method` varchar(50) DEFAULT NULL,
  `Payment_Status` varchar(50) DEFAULT NULL,
  `Expense_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `Feedback_ID` int(11) NOT NULL,
  `Feedback_Date` date DEFAULT NULL,
  `Rating` int(11) DEFAULT NULL CHECK (`Rating` between 1 and 5),
  `Comments` text DEFAULT NULL,
  `Customer_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Feedback_Text` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_account`
--

CREATE TABLE `financial_account` (
  `account_id` int(11) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('BANK','CASH','CREDIT','OTHER') NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'USD',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `Inventory_ID` int(11) NOT NULL,
  `Stock_Level` int(11) NOT NULL,
  `Last_Updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Product_ID` int(11) DEFAULT NULL,
  `Supplier_ID` int(11) DEFAULT NULL,
  `reorder_level` int(11) NOT NULL DEFAULT 10,
  `optimal_level` int(11) NOT NULL DEFAULT 50,
  `bin_location` varchar(50) DEFAULT NULL,
  `warehouse_zone` varchar(50) DEFAULT NULL,
  `inventory_value_method` enum('FIFO','LIFO','AVERAGE') DEFAULT 'FIFO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_audit`
--

CREATE TABLE `inventory_audit` (
  `audit_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `previous_quantity` int(11) NOT NULL,
  `new_quantity` int(11) NOT NULL,
  `adjustment_reason` varchar(255) NOT NULL,
  `adjusted_by` int(11) NOT NULL,
  `adjusted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_batch`
--

CREATE TABLE `inventory_batch` (
  `batch_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `batch_number` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `cost_per_unit` decimal(15,2) NOT NULL,
  `manufactured_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `received_date` date NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_item`
--

CREATE TABLE `inventory_item` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `min_stock_level` int(11) DEFAULT 0,
  `reorder_level` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logistics`
--

CREATE TABLE `logistics` (
  `Logistics_ID` int(11) NOT NULL,
  `Staff_Name` varchar(100) DEFAULT NULL,
  `Estimated_Delivery_Date` date DEFAULT NULL,
  `Delivery_Status` varchar(50) DEFAULT NULL,
  `Order_ID` int(11) DEFAULT NULL,
  `Staff_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `Order_Item_ID` int(11) NOT NULL,
  `Order_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `Price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`Order_Item_ID`, `Order_ID`, `Product_ID`, `Quantity`, `Price`) VALUES
(1, 1, 1, 5, NULL),
(2, 1, 2, 1, NULL),
(3, 2, 2, 1, NULL),
(4, 3, 3, 1, NULL),
(5, 3, 4, 1, NULL),
(6, 7, NULL, 1, NULL),
(7, 7, NULL, 2, NULL),
(8, 7, NULL, 1, NULL),
(9, 7, NULL, 1, NULL),
(10, 8, NULL, 1, NULL),
(11, 8, NULL, 2, NULL),
(12, 8, NULL, 1, NULL),
(13, 8, NULL, 1, NULL),
(14, 9, NULL, 4, NULL),
(15, 9, NULL, 1, NULL),
(16, 10, NULL, 1, NULL),
(17, 10, NULL, 2, NULL),
(18, 10, NULL, 3, NULL),
(19, 10, NULL, 5, NULL),
(22, 12, NULL, 3, NULL),
(23, 12, NULL, 1, NULL),
(24, 13, NULL, 3, 12999.00),
(25, 13, NULL, 1, 2499.00),
(26, 13, NULL, 1, 1799.00),
(27, 14, NULL, 1, 1799.00);

-- --------------------------------------------------------

--
-- Table structure for table `owner`
--

CREATE TABLE `owner` (
  `Owner_ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Address` text DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owner`
--

INSERT INTO `owner` (`Owner_ID`, `Name`, `Email`, `Password`, `Address`, `Phone_Number`) VALUES
(2, 'System Administrator', 'admin@yoursystem.com', '$2a$10$75ZElUkKfUGLkGbaBwbxp.vVfFrJrzMAw5Sh.UQtpx9h1TS1bCaN2', 'System Address', '1234567890');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `Payment_ID` int(11) NOT NULL,
  `Payment_Date` date DEFAULT NULL,
  `Payment_Amount` decimal(10,2) DEFAULT NULL,
  `Payment_Method` varchar(50) DEFAULT NULL,
  `Payment_Status` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_gateway` varchar(50) DEFAULT 'payhere',
  `Order_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `Product_ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL,
  `SKU` varchar(100) DEFAULT NULL,
  `Category` varchar(100) DEFAULT NULL,
  `Stock_Level` int(11) DEFAULT NULL,
  `Manufacturer` varchar(100) DEFAULT NULL,
  `Image_URL` varchar(255) DEFAULT NULL,
  `Supplier_ID` int(11) DEFAULT NULL,
  `Price` int(255) NOT NULL,
  `image_public_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`Product_ID`, `Name`, `Description`, `SKU`, `Category`, `Stock_Level`, `Manufacturer`, `Image_URL`, `Supplier_ID`, `Price`, `image_public_id`) VALUES
(1, 'Cordless Drill', NULL, NULL, 'Power Tools', 25, 'Bosch', 'https://asset.cloudinary.com/djy8hclco/778366066797462f6a21f3d7291ce4bc', NULL, 12999, '1_y4ivw6'),
(2, 'Claw Hammer', NULL, NULL, 'Hand Tools', 50, 'Stanley', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/hammer.jpg', NULL, 2499, ''),
(3, 'Adjustable Wrench', NULL, NULL, 'Plumbing', 40, 'Crescent', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/wrench.jpg', NULL, 1799, ''),
(4, 'Circular Saw', NULL, NULL, 'Power Tools', 15, 'DeWalt', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/saw.jpg', NULL, 18999, ''),
(5, 'Safety Gloves', NULL, NULL, 'Safety Gear', 100, '3M', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/gloves.jpg', NULL, 899, ''),
(6, 'Paint Brushes Set', NULL, NULL, 'Painting', 30, 'Purdy', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/brushes.jpg', NULL, 1499, ''),
(7, 'Steel Ladder', NULL, NULL, 'Access Equipment', 10, 'Werner', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/ladder.jpg', NULL, 24999, ''),
(8, 'Voltage Tester', NULL, NULL, 'Electrical', 20, 'Klein Tools', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/tester.jpg', NULL, 2999, ''),
(9, 'Toolbox', NULL, NULL, 'Storage', 35, 'Stanley', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/toolbox.jpg', NULL, 5999, ''),
(10, 'Work Boots', NULL, NULL, 'Safety Gear', 45, 'Timberland PRO', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/boots.jpg', NULL, 7999, '');

-- --------------------------------------------------------

--
-- Table structure for table `product_changes`
--

CREATE TABLE `product_changes` (
  `Product_Change_ID` int(11) NOT NULL,
  `Changed_Price` decimal(10,2) DEFAULT NULL,
  `Changed_Date` date DEFAULT NULL,
  `Changed_Manufacturer` varchar(100) DEFAULT NULL,
  `Changed_Brand` varchar(100) DEFAULT NULL,
  `Supplier_ID` int(11) DEFAULT NULL,
  `Store_Manager_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_tax_mapping`
--

CREATE TABLE `product_tax_mapping` (
  `mapping_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `tax_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_updates`
--

CREATE TABLE `product_updates` (
  `Product_Update_ID` int(11) NOT NULL,
  `Update_Date` date DEFAULT NULL,
  `Updated_Price` decimal(10,2) DEFAULT NULL,
  `Updated_Description` text DEFAULT NULL,
  `Updated_Manufacturer` varchar(100) DEFAULT NULL,
  `Updated_Brand` varchar(100) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

CREATE TABLE `promotion` (
  `Promotion_ID` int(11) NOT NULL,
  `Promotion_Name` varchar(100) NOT NULL,
  `Discount_Rate` decimal(5,2) DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `End_Date` date DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `promotion_type` enum('DISCOUNT','BOGO','BUNDLE','FLASH_SALE') NOT NULL,
  `min_quantity` int(11) DEFAULT 1,
  `free_product_id` int(11) DEFAULT NULL,
  `bundle_discount` decimal(5,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promotion`
--

INSERT INTO `promotion` (`Promotion_ID`, `Promotion_Name`, `Discount_Rate`, `Start_Date`, `End_Date`, `Product_ID`, `promotion_type`, `min_quantity`, `free_product_id`, `bundle_discount`, `is_active`) VALUES
(1, 'ANNIVERSARY SALE', 20.00, '2023-11-01', '2023-11-30', 1, 'DISCOUNT', 1, NULL, NULL, 1),
(2, 'FLASH SALE', 40.00, '2025-03-27', '2025-03-27', 3, 'FLASH_SALE', 1, NULL, NULL, 1),
(3, 'HAMMER COMBO', NULL, '2023-11-01', '2023-12-15', 2, 'BOGO', 1, 5, NULL, 1),
(4, 'POWER TOOLS BUNDLE', 15.00, '2023-11-10', '2023-12-10', 1, 'BUNDLE', 2, NULL, 15.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sales_transaction`
--

CREATE TABLE `sales_transaction` (
  `transaction_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `transaction_date` datetime DEFAULT current_timestamp(),
  `amount` decimal(15,2) NOT NULL,
  `transaction_type` enum('SALE','REFUND','DISCOUNT','TAX') NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `Staff_ID` int(11) NOT NULL,
  `First_Name` varchar(100) NOT NULL,
  `Last_Name` varchar(100) NOT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `Password` varchar(100) DEFAULT NULL,
  `Age` int(11) DEFAULT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `Email` varchar(100) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `Owner_ID` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`Staff_ID`, `First_Name`, `Last_Name`, `Phone_Number`, `Address`, `Password`, `Age`, `Gender`, `Email`, `role`, `status`, `Owner_ID`, `created_at`, `updated_at`) VALUES
(1, 'Kaushalya ', 'Wickramasinghe', '0123456789', NULL, '$2b$12$kQ9fdx85n8QNnGnbw2MhBOKDPIUUxS2MMP4WSloz.XlYU89TkO.le', NULL, NULL, 'gaming123@gmail.com', 'staff', 'active', 2, '2025-04-30 02:15:52', '2025-04-30 02:15:52'),
(47217, 'kanishka', 'dilhan', '0717577400', NULL, '$2b$12$eNq6cgRdnJxh24..me7dR.JUHpwzIOnHAChUb/zs7YNxA3eMmEYTa', NULL, NULL, 'kanishka@yoursystem.com', 'staff', 'active', 2, '2025-04-30 00:53:26', '2025-04-30 00:53:26');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movement`
--

CREATE TABLE `stock_movement` (
  `movement_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity_change` int(11) NOT NULL COMMENT 'Positive for incoming, negative for outgoing',
  `movement_type` enum('PURCHASE','SALE','ADJUSTMENT','RETURN','INVENTORY_COUNT','TRANSFER') NOT NULL,
  `movement_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reference_id` varchar(50) DEFAULT NULL COMMENT 'Related order/invoice/document number',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `previous_quantity` int(11) NOT NULL COMMENT 'Stock level before movement',
  `new_quantity` int(11) NOT NULL COMMENT 'Stock level after movement'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_manager`
--

CREATE TABLE `store_manager` (
  `Store_Manager_ID` int(11) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(100) DEFAULT NULL,
  `Role` varchar(50) DEFAULT NULL,
  `Notifications` text DEFAULT NULL,
  `Owner_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `Supplier_ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Contact_Person` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier_inventory`
--

CREATE TABLE `supplier_inventory` (
  `Supplier_Inventory_ID` int(11) NOT NULL,
  `Quantity_Supplied` int(11) DEFAULT NULL,
  `Price_Per_Unit` decimal(10,2) DEFAULT NULL,
  `Supply_Date` date DEFAULT NULL,
  `Supplier_ID` int(11) DEFAULT NULL,
  `Inventory_ID` int(11) DEFAULT NULL,
  `Product_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket`
--

CREATE TABLE `support_ticket` (
  `ticket_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED') DEFAULT 'OPEN',
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tax_rate`
--

CREATE TABLE `tax_rate` (
  `tax_id` int(11) NOT NULL,
  `tax_name` varchar(100) NOT NULL,
  `tax_rate` decimal(6,3) NOT NULL,
  `tax_type` enum('PERCENTAGE','FIXED') DEFAULT 'PERCENTAGE',
  `is_default` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_message`
--

CREATE TABLE `ticket_message` (
  `message_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `sender_type` enum('CUSTOMER','STAFF') NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Username` (`NAME`);

--
-- Indexes for table `customerorder`
--
ALTER TABLE `customerorder`
  ADD PRIMARY KEY (`Order_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`),
  ADD KEY `customerorder_ibfk_2` (`Staff_ID`);

--
-- Indexes for table `customer_segment`
--
ALTER TABLE `customer_segment`
  ADD PRIMARY KEY (`segment_id`);

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`Expense_ID`),
  ADD KEY `Expense_Category` (`Expense_Category`),
  ADD KEY `Store_Manager_ID` (`Store_Manager_ID`),
  ADD KEY `Owner_ID` (`Owner_ID`);

--
-- Indexes for table `expense_category`
--
ALTER TABLE `expense_category`
  ADD PRIMARY KEY (`Expense_Category_ID`),
  ADD UNIQUE KEY `Category_Name` (`Category_Name`),
  ADD KEY `idx_category_name` (`Category_Name`);

--
-- Indexes for table `expense_payment`
--
ALTER TABLE `expense_payment`
  ADD PRIMARY KEY (`Expense_Payment_ID`),
  ADD KEY `Expense_ID` (`Expense_ID`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`Feedback_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`),
  ADD KEY `Product_ID` (`Product_ID`);

--
-- Indexes for table `financial_account`
--
ALTER TABLE `financial_account`
  ADD PRIMARY KEY (`account_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`Inventory_ID`),
  ADD KEY `Product_ID` (`Product_ID`),
  ADD KEY `Supplier_ID` (`Supplier_ID`);

--
-- Indexes for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `adjusted_by` (`adjusted_by`);

--
-- Indexes for table `inventory_batch`
--
ALTER TABLE `inventory_batch`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `inventory_item`
--
ALTER TABLE `inventory_item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD KEY `category_index` (`category`),
  ADD KEY `supplier_index` (`supplier_id`);

--
-- Indexes for table `logistics`
--
ALTER TABLE `logistics`
  ADD PRIMARY KEY (`Logistics_ID`),
  ADD KEY `Order_ID` (`Order_ID`),
  ADD KEY `logistics_ibfk_2` (`Staff_ID`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`Order_Item_ID`),
  ADD KEY `Order_ID` (`Order_ID`),
  ADD KEY `Product_ID` (`Product_ID`);

--
-- Indexes for table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`Owner_ID`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`Payment_ID`),
  ADD KEY `Order_ID` (`Order_ID`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`Product_ID`),
  ADD KEY `Supplier_ID` (`Supplier_ID`);

--
-- Indexes for table `product_changes`
--
ALTER TABLE `product_changes`
  ADD PRIMARY KEY (`Product_Change_ID`),
  ADD KEY `Supplier_ID` (`Supplier_ID`),
  ADD KEY `Store_Manager_ID` (`Store_Manager_ID`);

--
-- Indexes for table `product_tax_mapping`
--
ALTER TABLE `product_tax_mapping`
  ADD PRIMARY KEY (`mapping_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `tax_id` (`tax_id`);

--
-- Indexes for table `product_updates`
--
ALTER TABLE `product_updates`
  ADD PRIMARY KEY (`Product_Update_ID`),
  ADD KEY `Product_ID` (`Product_ID`);

--
-- Indexes for table `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`Promotion_ID`),
  ADD KEY `Product_ID` (`Product_ID`),
  ADD KEY `free_product_id` (`free_product_id`);

--
-- Indexes for table `sales_transaction`
--
ALTER TABLE `sales_transaction`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`Staff_ID`),
  ADD KEY `Owner_ID` (`Owner_ID`);

--
-- Indexes for table `stock_movement`
--
ALTER TABLE `stock_movement`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_movement_date` (`movement_date`),
  ADD KEY `idx_product_movement` (`product_id`,`movement_date`);

--
-- Indexes for table `store_manager`
--
ALTER TABLE `store_manager`
  ADD PRIMARY KEY (`Store_Manager_ID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD KEY `Owner_ID` (`Owner_ID`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`Supplier_ID`);

--
-- Indexes for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  ADD PRIMARY KEY (`Supplier_Inventory_ID`),
  ADD KEY `Supplier_ID` (`Supplier_ID`),
  ADD KEY `Inventory_ID` (`Inventory_ID`),
  ADD KEY `Product_ID` (`Product_ID`);

--
-- Indexes for table `support_ticket`
--
ALTER TABLE `support_ticket`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `tax_rate`
--
ALTER TABLE `tax_rate`
  ADD PRIMARY KEY (`tax_id`);

--
-- Indexes for table `ticket_message`
--
ALTER TABLE `ticket_message`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customerorder`
--
ALTER TABLE `customerorder`
  MODIFY `Order_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `customer_segment`
--
ALTER TABLE `customer_segment`
  MODIFY `segment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `Expense_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_category`
--
ALTER TABLE `expense_category`
  MODIFY `Expense_Category_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_payment`
--
ALTER TABLE `expense_payment`
  MODIFY `Expense_Payment_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `Feedback_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_account`
--
ALTER TABLE `financial_account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `Inventory_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_batch`
--
ALTER TABLE `inventory_batch`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_item`
--
ALTER TABLE `inventory_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logistics`
--
ALTER TABLE `logistics`
  MODIFY `Logistics_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `Order_Item_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `owner`
--
ALTER TABLE `owner`
  MODIFY `Owner_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `Payment_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `Product_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_changes`
--
ALTER TABLE `product_changes`
  MODIFY `Product_Change_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_tax_mapping`
--
ALTER TABLE `product_tax_mapping`
  MODIFY `mapping_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_updates`
--
ALTER TABLE `product_updates`
  MODIFY `Product_Update_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion`
--
ALTER TABLE `promotion`
  MODIFY `Promotion_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales_transaction`
--
ALTER TABLE `sales_transaction`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `Staff_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47218;

--
-- AUTO_INCREMENT for table `stock_movement`
--
ALTER TABLE `stock_movement`
  MODIFY `movement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_manager`
--
ALTER TABLE `store_manager`
  MODIFY `Store_Manager_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `Supplier_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  MODIFY `Supplier_Inventory_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_ticket`
--
ALTER TABLE `support_ticket`
  MODIFY `ticket_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_rate`
--
ALTER TABLE `tax_rate`
  MODIFY `tax_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_message`
--
ALTER TABLE `ticket_message`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customerorder`
--
ALTER TABLE `customerorder`
  ADD CONSTRAINT `customerorder_ibfk_1` FOREIGN KEY (`Customer_ID`) REFERENCES `customer` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customerorder_ibfk_2` FOREIGN KEY (`Staff_ID`) REFERENCES `staff` (`Staff_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `expense_ibfk_1` FOREIGN KEY (`Expense_Category`) REFERENCES `expense_category` (`Category_Name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expense_ibfk_2` FOREIGN KEY (`Store_Manager_ID`) REFERENCES `store_manager` (`Store_Manager_ID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expense_ibfk_3` FOREIGN KEY (`Owner_ID`) REFERENCES `owner` (`Owner_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expense_payment`
--
ALTER TABLE `expense_payment`
  ADD CONSTRAINT `expense_payment_ibfk_1` FOREIGN KEY (`Expense_ID`) REFERENCES `expense` (`Expense_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`Customer_ID`) REFERENCES `customer` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`Supplier_ID`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  ADD CONSTRAINT `inventory_audit_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`),
  ADD CONSTRAINT `inventory_audit_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `inventory_batch` (`batch_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_audit_ibfk_3` FOREIGN KEY (`adjusted_by`) REFERENCES `staff` (`Staff_ID`);

--
-- Constraints for table `inventory_batch`
--
ALTER TABLE `inventory_batch`
  ADD CONSTRAINT `inventory_batch_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_batch_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE SET NULL;

--
-- Constraints for table `logistics`
--
ALTER TABLE `logistics`
  ADD CONSTRAINT `logistics_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `customerorder` (`Order_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `logistics_ibfk_2` FOREIGN KEY (`Staff_ID`) REFERENCES `staff` (`Staff_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `customerorder` (`Order_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `customerorder` (`Order_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`Supplier_ID`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product_changes`
--
ALTER TABLE `product_changes`
  ADD CONSTRAINT `product_changes_ibfk_1` FOREIGN KEY (`Supplier_ID`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_changes_ibfk_2` FOREIGN KEY (`Store_Manager_ID`) REFERENCES `store_manager` (`Store_Manager_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_tax_mapping`
--
ALTER TABLE `product_tax_mapping`
  ADD CONSTRAINT `product_tax_mapping_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_tax_mapping_ibfk_2` FOREIGN KEY (`tax_id`) REFERENCES `tax_rate` (`tax_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_updates`
--
ALTER TABLE `product_updates`
  ADD CONSTRAINT `product_updates_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `promotion`
--
ALTER TABLE `promotion`
  ADD CONSTRAINT `promotion_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promotion_ibfk_2` FOREIGN KEY (`free_product_id`) REFERENCES `product` (`Product_ID`);

--
-- Constraints for table `sales_transaction`
--
ALTER TABLE `sales_transaction`
  ADD CONSTRAINT `sales_transaction_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `customerorder` (`Order_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_transaction_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_account` (`account_id`),
  ADD CONSTRAINT `sales_transaction_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `staff` (`Staff_ID`);

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`Owner_ID`) REFERENCES `owner` (`Owner_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_movement`
--
ALTER TABLE `stock_movement`
  ADD CONSTRAINT `stock_movement_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`),
  ADD CONSTRAINT `stock_movement_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `staff` (`Staff_ID`);

--
-- Constraints for table `store_manager`
--
ALTER TABLE `store_manager`
  ADD CONSTRAINT `store_manager_ibfk_1` FOREIGN KEY (`Owner_ID`) REFERENCES `owner` (`Owner_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  ADD CONSTRAINT `supplier_inventory_ibfk_1` FOREIGN KEY (`Supplier_ID`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `supplier_inventory_ibfk_2` FOREIGN KEY (`Inventory_ID`) REFERENCES `inventory` (`Inventory_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `supplier_inventory_ibfk_3` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `support_ticket`
--
ALTER TABLE `support_ticket`
  ADD CONSTRAINT `support_ticket_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_ticket_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `customerorder` (`Order_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_ticket_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`Staff_ID`) ON DELETE SET NULL;

--
-- Constraints for table `ticket_message`
--
ALTER TABLE `ticket_message`
  ADD CONSTRAINT `ticket_message_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_ticket` (`ticket_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
