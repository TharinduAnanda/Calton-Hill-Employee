-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2025 at 11:26 PM
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

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetProductDetailsById` (IN `productId` INT)   BEGIN
    SELECT 
        p.*,
        i.Stock_Level as stock_quantity,
        i.reorder_level,
        i.optimal_level,
        i.bin_location,
        i.warehouse_zone,
        i.inventory_value_method,
        i.reorder_quantity,
        i.storage_location,
        i.unit_of_measure as inventory_unit,
        s.Name as supplier_name,
        s.Supplier_ID as supplier_id,
        pc.id as category_id,
        ps.id as subcategory_id
    FROM 
        product p
    LEFT JOIN 
        inventory i ON p.Product_ID = i.Product_ID
    LEFT JOIN 
        supplier s ON p.Supplier_ID = s.Supplier_ID
    LEFT JOIN
        product_categories pc ON p.Category = pc.id
    LEFT JOIN
        product_subcategories ps ON p.subcategory_id = ps.id OR ps.id = p.Subcategory
    WHERE 
        p.Product_ID = productId;
END$$

DELIMITER ;

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
  `redeemed_points` int(11) DEFAULT 0,
  `last_points_update` date DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`ID`, `NAME`, `EMAIL`, `PHONE_NUM`, `PASSWORD`, `resetToken`, `resetTokenExpiry`, `createdAt`, `updatedAt`, `birthdate`, `gender`, `loyalty_points`, `customer_since`, `last_purchase_date`, `total_spent`, `customer_segment`, `notes`, `marketing_consent`, `redeemed_points`, `last_points_update`, `street`, `city`, `state`, `zipCode`, `country`) VALUES
(1, 'Tharindu Lalanath Ananda', 'tharindulalanath49@gmail.com', '1234567890', '$2b$10$0IYi9qJj0gVI0VToI5p7sewUSZV0Wekq2pVCRScNc7M7uUrAOcK6e', NULL, NULL, '2025-02-25 23:52:37', '2025-02-25 23:52:37', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Manel Ananda', 'manel@gmail.com', '0712128692', '$2b$10$ppudb7f1S5V4Ztnpb4QZWeEfJdGx.sxqhpgKTe2v4Y76Rd31gauMy', NULL, NULL, '2025-03-04 21:48:13', '2025-03-04 21:48:13', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Kanishka Ananda', 'anandae-im21040@stu.kln.ac.lk', '0717577400', '$2b$10$1B7fTOK/NeDowX/syrZfPuhxhuhvZAvFEENBgIO0OUVmjEmzCrpnm', NULL, NULL, '2025-03-19 07:11:04', '2025-03-19 07:11:04', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Lakshitha Sampath', 'lakshitha@gmail.com', '0717577400', '$2b$10$yE1w9NXTu.lBgR7UJOdok.g7d3LvX5CcPqCdCFGE/8uo/DFx1ozEu', NULL, NULL, '2025-03-25 11:46:38', '2025-03-25 11:46:38', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'dhanuka Wimalarathana', 'dhanuka@gmail.com', '0717577400', '$2b$10$KxqeGQUVird4Bjn1fbo5XuFzHeYRBvJ731f.60MfpuwPmqfyCRuaa', NULL, NULL, '2025-03-25 11:47:47', '2025-03-25 11:47:47', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Test User', 'test@example.com', '1234567890', '$2b$10$9zRuSHe5PbxNEpcQsRhZi.HSF3n/m6LTvJWtDxBSDVAQbMLyXKfOq', NULL, NULL, '2025-03-26 01:08:10', '2025-03-26 01:08:10', NULL, 'PREFER_NOT_SAY', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'kanishka dilhan', 'dilhan@gmail.com', '0756752980', '$2b$10$OHUKUH/2Rw02kwN.CiMege7A3DCBHvQFopJGDbtq8M32rrcqKi1ne', NULL, NULL, '2025-03-26 01:12:44', '2025-05-20 20:25:25', '2006-05-26', 'MALE', 0, '2025-05-01', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Binaru Ranasinghe', 'binaru@gmail.com', NULL, '$2b$10$Qj/y7NJBeuvrg3G4oR0f9uUx3ybwoUAWq6usHveH5aZpkWAZNuv86', NULL, NULL, '2025-05-20 20:40:00', '2025-05-20 20:40:00', NULL, 'PREFER_NOT_SAY', 0, '2025-05-21', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Kaushalya Wickramasinghe', 'kaushalya@gmail.com', NULL, '$2b$10$igZwMU19eRJWUdVPvzupleXqS7kxexEW4LyC7N8nW/hImeYBbHBOC', NULL, NULL, '2025-05-20 20:43:19', '2025-05-20 20:44:33', NULL, 'PREFER_NOT_SAY', 0, '2025-05-21', NULL, 0.00, 'GENERAL', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Lakshitha Thilina', 'businesstharindu30@gmail.com', '0717577400', '$2b$10$NvcZEScEeS/0UqqYsLgb9OrVyBa8iI0Ytj/z/2hl1PQHPbnzXE6Lm', NULL, NULL, '2025-05-20 20:46:36', '2025-05-20 23:16:55', '2001-04-05', 'MALE', 0, '2025-05-21', NULL, 0.00, 'GENERAL', NULL, 1, 0, NULL, '100/2', 'Rakwana', 'Rathnapura', '70300', 'Sri Lanka');

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
  `Staff_ID` int(11) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerorder`
--

INSERT INTO `customerorder` (`Order_ID`, `Order_Date`, `Total_Amount`, `Payment_Status`, `payment_reference`, `payment_method`, `Delivery_Address`, `Delivery_Status`, `Customer_ID`, `Staff_ID`, `source`) VALUES
(1, '2024-03-15 00:00:00', 259.98, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2, '2024-03-20 00:00:00', 199.99, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(3, '2024-03-22 00:00:00', 139.98, 'paid', NULL, NULL, NULL, 'shipped', 7, NULL, NULL),
(7, '2025-05-19 11:11:29', 49295.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL, NULL),
(8, '2025-05-19 11:11:29', 49295.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL, NULL),
(9, '2025-05-19 11:11:29', 13495.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL, NULL),
(10, '2025-05-19 11:11:29', 16789.00, 'paid', NULL, 'payhere', NULL, 'pending', 7, NULL, NULL),
(12, '2025-05-19 11:11:29', 41496.00, 'paid', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL, NULL),
(13, '2025-04-26 03:02:21', 43295.00, 'pending', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL, NULL),
(14, '2025-05-01 13:37:30', 2299.00, 'pending', NULL, 'payhere', '{\"firstName\":\"kanishka\",\"lastName\":\"dilhan\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0717577400\",\"email\":\"dilhan@gmail.com\"}', 'pending', 7, NULL, NULL),
(101, '2025-04-01 00:00:00', 12000.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(102, '2025-04-15 00:00:00', 18500.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(103, '2025-05-01 00:00:00', 25000.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(104, '2025-05-10 00:00:00', 9800.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2001, '2025-04-01 00:00:00', 12000.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2002, '2025-04-15 00:00:00', 18500.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2003, '2025-05-01 00:00:00', 25000.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2004, '2025-05-10 00:00:00', 9800.00, 'paid', NULL, NULL, NULL, 'delivered', 7, NULL, NULL),
(2005, '2025-05-20 04:06:07', 2299.00, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2006, '2025-05-20 04:06:37', 2299.00, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2007, '2025-05-20 09:04:22', 35997.20, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2008, '2025-05-20 09:23:49', 35097.20, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2009, '2025-05-20 09:30:02', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2010, '2025-05-20 09:40:50', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2011, '2025-05-20 09:41:32', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2012, '2025-05-20 09:43:05', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2013, '2025-05-20 09:46:25', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2014, '2025-05-20 09:52:50', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2015, '2025-05-20 10:01:25', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2016, '2025-05-20 10:02:04', 19797.10, 'pending', NULL, 'payhere', '{\"firstName\":\"Tharindu\",\"lastName\":\"Ananda\",\"address\":\"100/1\",\"city\":\"rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0123456789\",\"email\":\"tharindulalanath49@gmail.com\"}', 'pending', 7, NULL, NULL),
(2017, '2025-05-21 00:16:36', 34198.20, 'pending', NULL, 'payhere', '{\"address\":\"\",\"city\":\"\",\"country\":\"Sri Lanka\",\"phone\":\"\",\"email\":\"Lakshitha123@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2018, '2025-05-21 00:22:44', 34198.20, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2019, '2025-05-21 00:28:31', 34198.20, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2020, '2025-05-21 00:37:06', 4995.00, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2021, '2025-05-21 00:49:00', 2299.00, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2022, '2025-05-21 01:12:55', 17099.10, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website'),
(2023, '2025-05-21 01:25:11', 17099.10, 'pending', NULL, 'payhere', '{\"address\":\"100/2\",\"city\":\"Rakwana\",\"country\":\"Sri Lanka\",\"phone\":\"0756752980\",\"email\":\"binaru@gmail.com\"}', 'pending', 11, NULL, 'website');

-- --------------------------------------------------------

--
-- Table structure for table `customer_address`
--

CREATE TABLE `customer_address` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL DEFAULT 'Sri Lanka',
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `email_campaigns`
--

CREATE TABLE `email_campaigns` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `from_email` varchar(100) DEFAULT 'marketing@hardwarestore.com',
  `from_name` varchar(100) DEFAULT 'Hardware Store Team',
  `segment_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'email',
  `status` enum('DRAFT','SCHEDULED','SENDING','SENT','CANCELLED') DEFAULT 'DRAFT',
  `scheduled_date` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_campaign_batches`
--

CREATE TABLE `email_campaign_batches` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `total_recipients` int(11) DEFAULT NULL,
  `success_count` int(11) DEFAULT 0,
  `fail_count` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_campaign_logs`
--

CREATE TABLE `email_campaign_logs` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `sent` tinyint(1) DEFAULT 0,
  `opened` tinyint(1) DEFAULT 0,
  `clicked` tinyint(1) DEFAULT 0,
  `bounced` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL,
  `opened_at` timestamp NULL DEFAULT NULL,
  `clicked_at` timestamp NULL DEFAULT NULL
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

--
-- Dumping data for table `expense_category`
--

INSERT INTO `expense_category` (`Expense_Category_ID`, `Category_Name`, `Category_Description`) VALUES
(1, 'Rent', 'Office and store rent'),
(2, 'Utilities', 'Electricity, water, internet'),
(3, 'Payroll', 'Employee salaries and wages'),
(4, 'Supplies', 'Office supplies'),
(5, 'Marketing', 'Advertising and promotions'),
(6, 'Maintenance', 'Building and equipment maintenance'),
(7, 'Insurance', 'Business insurance costs'),
(8, 'Taxes', 'Business taxes and fees');

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
  `Product_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`Feedback_ID`, `Feedback_Date`, `Rating`, `Comments`, `Customer_ID`, `Product_ID`) VALUES
(1, '2025-05-21', 4, 'I have bought this product.its good product', NULL, 5),
(2, '2025-05-21', 3, 'haii', 7, 5);

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

--
-- Dumping data for table `financial_account`
--

INSERT INTO `financial_account` (`account_id`, `account_name`, `account_type`, `account_number`, `opening_balance`, `current_balance`, `currency`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Main Checking', 'BANK', NULL, 50000.00, 50000.00, 'USD', 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(2, 'Savings Account', 'BANK', NULL, 25000.00, 25000.00, 'USD', 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(3, 'Cash Register', 'CASH', NULL, 1000.00, 1000.00, 'USD', 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(4, 'Business Credit Card', 'CREDIT', NULL, 0.00, 0.00, 'USD', 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(5, 'Main Checking', 'BANK', NULL, 50000.00, 50000.00, 'USD', 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18'),
(6, 'Savings Account', 'BANK', NULL, 25000.00, 25000.00, 'USD', 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18'),
(7, 'Cash Register', 'CASH', NULL, 1000.00, 1000.00, 'USD', 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18'),
(8, 'Business Credit Card', 'CREDIT', NULL, 0.00, 0.00, 'USD', 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18');

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
  `inventory_value_method` enum('FIFO','LIFO','AVERAGE') DEFAULT 'FIFO',
  `reorder_quantity` int(11) DEFAULT 0,
  `storage_location` varchar(100) DEFAULT NULL,
  `unit_of_measure` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`Inventory_ID`, `Stock_Level`, `Last_Updated`, `Product_ID`, `Supplier_ID`, `reorder_level`, `optimal_level`, `bin_location`, `warehouse_zone`, `inventory_value_method`, `reorder_quantity`, `storage_location`, `unit_of_measure`) VALUES
(1, 0, '2025-05-19 22:22:40', 12, 5, 500, 900, NULL, NULL, 'FIFO', 0, NULL, NULL),
(2, 20, '2025-05-17 05:35:22', 15, NULL, 5, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(4, 60, '2025-05-18 17:55:54', 17, 4, 5, 50, NULL, NULL, 'FIFO', 14, NULL, 'set'),
(5, 1002, '2025-05-18 17:50:29', 18, 4, 150, 50, NULL, NULL, 'FIFO', 650, NULL, 'piece'),
(6, 49, '2025-05-19 05:33:34', 10, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(7, 49, '2025-05-19 05:33:34', 10, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(8, 49, '2025-05-19 05:33:34', 10, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(9, 49, '2025-05-19 05:33:34', 10, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(10, 48, '2025-05-19 05:33:34', 2, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(11, 51, '2025-05-21 03:36:37', 3, NULL, 10, 50, NULL, NULL, 'FIFO', 0, NULL, NULL),
(12, 49, '2025-05-19 05:33:34', 4, NULL, 11, 84, NULL, NULL, 'FIFO', 0, NULL, NULL),
(13, 44, '2025-05-19 05:33:34', 5, NULL, 12, 156, NULL, NULL, 'FIFO', 0, NULL, NULL),
(14, 49, '2025-05-19 05:33:34', 7, NULL, 11, 60, NULL, NULL, 'FIFO', 0, NULL, NULL),
(15, 48, '2025-05-19 05:33:34', 8, NULL, 11, 162, NULL, NULL, 'FIFO', 0, NULL, NULL),
(16, 57, '2025-05-19 00:58:03', 11, NULL, 14, 86, NULL, NULL, 'FIFO', 0, NULL, NULL),
(17, 22, '2025-05-19 00:58:03', 13, NULL, 7, 33, NULL, NULL, 'FIFO', 0, NULL, NULL),
(18, 105, '2025-05-19 00:58:03', 14, NULL, 12, 158, NULL, NULL, 'FIFO', 0, NULL, NULL),
(22, 8, '2025-05-19 20:45:21', 20, 4, 10, 40, NULL, NULL, 'FIFO', 18, 'Warehouse B - Power Tools Section R5', 'set'),
(23, 0, '2025-05-19 23:12:30', 21, 4, 50, 300, NULL, NULL, 'FIFO', 100, 'Warehouse A - Shelf 12B', NULL),
(25, 1000, '2025-05-21 03:02:17', 22, 5, 100, 600, NULL, NULL, 'FIFO', 500, 'Warehouse A', 'piece'),
(26, 1000, '2025-05-21 03:02:19', 22, 5, 100, 600, NULL, NULL, 'FIFO', 500, 'Warehouse A', 'piece');

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
-- Table structure for table `loyalty_points_transactions`
--

CREATE TABLE `loyalty_points_transactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `transaction_type` enum('earn','redeem','expire','adjust') NOT NULL,
  `description` text DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_rewards`
--

CREATE TABLE `loyalty_rewards` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `points_required` int(11) NOT NULL,
  `reward_type` enum('discount','fixed','product','shipping') NOT NULL,
  `reward_value` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loyalty_rewards`
--

INSERT INTO `loyalty_rewards` (`id`, `store_id`, `name`, `description`, `points_required`, `reward_type`, `reward_value`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Beagle', 'asebfdv', 100, 'fixed', '10', 1, '2025-05-18 15:31:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_settings`
--

CREATE TABLE `loyalty_settings` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `program_enabled` tinyint(1) DEFAULT 1,
  `points_per_dollar` decimal(10,2) NOT NULL DEFAULT 1.00,
  `min_points_redemption` int(11) NOT NULL DEFAULT 100,
  `points_value_factor` decimal(10,4) NOT NULL DEFAULT 0.0100,
  `expiry_period_days` int(11) NOT NULL DEFAULT 365,
  `welcome_bonus` int(11) NOT NULL DEFAULT 100,
  `birthday_bonus` int(11) NOT NULL DEFAULT 50,
  `referral_bonus` int(11) NOT NULL DEFAULT 50,
  `vip_tiers_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loyalty_settings`
--

INSERT INTO `loyalty_settings` (`id`, `store_id`, `program_enabled`, `points_per_dollar`, `min_points_redemption`, `points_value_factor`, `expiry_period_days`, `welcome_bonus`, `birthday_bonus`, `referral_bonus`, `vip_tiers_enabled`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1.00, 100, 1.0100, 365, 100, 50, 50, 1, '2025-05-18 15:24:54', '2025-05-18 15:30:11');

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_tiers`
--

CREATE TABLE `loyalty_tiers` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `points_threshold` int(11) NOT NULL,
  `benefits` text DEFAULT NULL,
  `multiplier` decimal(3,1) DEFAULT 1.0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loyalty_tiers`
--

INSERT INTO `loyalty_tiers` (`id`, `store_id`, `name`, `points_threshold`, `benefits`, `multiplier`, `created_at`, `updated_at`) VALUES
(1, 1, 'GOLD', 1000, 'svsdwev', 1.0, '2025-05-18 15:31:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `marketing_campaigns`
--

CREATE TABLE `marketing_campaigns` (
  `campaign_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('email','sms','social','direct_mail') NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `target_segment` varchar(100) DEFAULT NULL,
  `status` enum('draft','scheduled','sending','sent','cancelled') DEFAULT 'draft',
  `scheduled_date` datetime DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `recipients_count` int(11) DEFAULT NULL,
  `open_rate` decimal(5,2) DEFAULT NULL,
  `click_rate` decimal(5,2) DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `sender_type` enum('CUSTOMER','STAFF') NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `read_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_threads`
--

CREATE TABLE `message_threads` (
  `thread_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `status` enum('OPEN','ACTIVE','CLOSED') DEFAULT 'OPEN',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_message_at` timestamp NULL DEFAULT NULL
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
(27, 14, NULL, 1, 1799.00),
(1000, 101, 2, 2, 2499.00),
(1001, 101, 3, 1, 1799.00),
(1002, 101, 5, 6, 899.00),
(1003, 102, 4, 1, 18999.00),
(1004, 103, 7, 1, 24999.00),
(1005, 104, 8, 2, 2999.00),
(1006, 104, 10, 1, 7999.00),
(2000, 2001, 2, 2, 2499.00),
(2001, 2001, 3, 1, 1799.00),
(2002, 2001, 5, 6, 899.00),
(2003, 2002, 4, 1, 18999.00),
(2004, 2003, 7, 1, 24999.00),
(2005, 2004, 8, 2, 2999.00),
(2006, 2004, 10, 1, 7999.00),
(2007, 2005, NULL, 1, 1799.00),
(2008, 2006, NULL, 1, 1799.00),
(2009, 2007, NULL, 2, 18999.00),
(2010, 2007, NULL, 1, 1799.00),
(2011, 2008, NULL, 2, 18999.00),
(2012, 2008, NULL, 1, 899.00),
(2013, 2009, NULL, 1, 1799.00),
(2014, 2009, NULL, 1, 18999.00),
(2015, 2009, NULL, 1, 899.00),
(2016, 2010, NULL, 1, 1799.00),
(2017, 2010, NULL, 1, 18999.00),
(2018, 2010, NULL, 1, 899.00),
(2019, 2011, NULL, 1, 1799.00),
(2020, 2011, NULL, 1, 18999.00),
(2021, 2011, NULL, 1, 899.00),
(2022, 2012, NULL, 1, 1799.00),
(2023, 2012, NULL, 1, 18999.00),
(2024, 2012, NULL, 1, 899.00),
(2025, 2013, NULL, 1, 1799.00),
(2026, 2013, NULL, 1, 18999.00),
(2027, 2013, NULL, 1, 899.00),
(2028, 2014, NULL, 1, 1799.00),
(2029, 2014, NULL, 1, 18999.00),
(2030, 2014, NULL, 1, 899.00),
(2031, 2015, NULL, 1, 1799.00),
(2032, 2015, NULL, 1, 18999.00),
(2033, 2015, NULL, 1, 899.00),
(2034, 2016, NULL, 1, 1799.00),
(2035, 2016, NULL, 1, 18999.00),
(2036, 2016, NULL, 1, 899.00),
(2037, 2017, NULL, 2, 18999.00),
(2038, 2018, NULL, 2, 18999.00),
(2039, 2019, NULL, 2, 18999.00),
(2040, 2020, NULL, 5, 899.00),
(2041, 2021, NULL, 1, 1799.00),
(2042, 2022, NULL, 1, 18999.00),
(2043, 2023, NULL, 1, 18999.00);

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
  `Brand` varchar(100) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `SKU` varchar(100) DEFAULT NULL,
  `Category` varchar(100) DEFAULT NULL,
  `subcategory_id` varchar(50) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `Subcategory` varchar(100) DEFAULT NULL,
  `Manufacturer` varchar(100) DEFAULT NULL,
  `Image_URL` varchar(255) DEFAULT NULL,
  `Supplier_ID` int(11) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Status` varchar(50) DEFAULT 'active',
  `image_public_id` varchar(255) NOT NULL,
  `unit_of_measure` varchar(50) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `tax_percentage` decimal(5,2) DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `length` decimal(10,2) DEFAULT NULL,
  `width` decimal(10,2) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `material_type` varchar(50) DEFAULT NULL,
  `thickness` decimal(8,2) DEFAULT NULL,
  `color_options` varchar(255) DEFAULT NULL,
  `voltage` varchar(50) DEFAULT NULL,
  `power_source` varchar(50) DEFAULT NULL,
  `coverage_area` varchar(50) DEFAULT NULL,
  `finish_type` varchar(50) DEFAULT NULL,
  `certification_info` varchar(255) DEFAULT NULL,
  `warranty_period` int(11) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `lead_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`Product_ID`, `Name`, `Brand`, `Description`, `SKU`, `Category`, `subcategory_id`, `cost_price`, `Subcategory`, `Manufacturer`, `Image_URL`, `Supplier_ID`, `Price`, `Status`, `image_public_id`, `unit_of_measure`, `discount_percentage`, `tax_percentage`, `specifications`, `weight`, `length`, `width`, `height`, `material_type`, `thickness`, `color_options`, `voltage`, `power_source`, `coverage_area`, `finish_type`, `certification_info`, `warranty_period`, `expiry_date`, `lead_time`) VALUES
(2, 'Claw Hammer', 'MITIYA', '', 'ITM-2345', 'Tools & Equipment', 'hand-tools', 1800.00, 'hand-tools', 'Stanley', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747709718/products/b9nmf7owqrgkkandhzz3.jpg', 5, 2499.00, 'active', 'products/b9nmf7owqrgkkandhzz3', NULL, 10.00, NULL, NULL, NULL, NULL, NULL, NULL, 'steel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Adjustable Wrench', 'TOOLS LANKA', '', 'ITM-22213', 'Tools & Equipment', 'hand-tools', 1200.00, 'hand-tools', 'Crescent', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747710646/products/cq6xbrnbdmdsqfkgusnj.jpg', NULL, 1799.00, 'active', 'products/cq6xbrnbdmdsqfkgusnj', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Circular Saw', 'PowerPro', '', 'ITM-85614', 'Tools & Equipment', 'power-tools', 15000.00, 'power-tools', 'DeWalt', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747710752/products/fybu3cqeyrogyhirhgul.jpg', NULL, 18999.00, 'active', 'products/fybu3cqeyrogyhirhgul', NULL, 10.00, NULL, NULL, 2.80, 38.00, 30.00, 12.00, NULL, NULL, NULL, '20v', NULL, NULL, NULL, NULL, 36, NULL, NULL),
(5, 'Safety Gloves', 'SAFETY PRO', '', 'ITM-98516', 'Safety, Security & Fire Protection', 'ppe', 600.00, 'ppe', '3M', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747710855/products/v0wokqnvmk7vbxsfukhn.jpg', NULL, 899.00, 'active', 'products/v0wokqnvmk7vbxsfukhn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Steel Ladder', NULL, NULL, NULL, NULL, NULL, 20000.00, NULL, 'Werner', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/ladder.jpg', NULL, 24999.00, 'active', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Voltage Tester', NULL, NULL, NULL, 'electrical', NULL, 2100.00, NULL, 'Klein Tools', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/tester.jpg', NULL, 2999.00, 'active', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Work Boots', NULL, NULL, NULL, NULL, NULL, 6000.00, NULL, 'Timberland PRO', 'https://res.cloudinary.com/your-cloud/image/upload/v12345/boots.jpg', NULL, 7999.00, 'active', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Plywood Alostonia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 700.00, 'active', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Wall Plugs', 'WALL GO', 'hvknvkde', 'ITM-12345', 'Fasteners & Fixings', NULL, 170.00, 'anchors-plugs', 'VENU PVT', NULL, 5, 200.00, 'active', 'placeholder_image_id_1747450846113', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, '200 V Generator', 'Singer', 'gbfhfhbty', 'ITM-1234567', 'Electrical & Lighting', NULL, 15000.00, 'generators', 'Singer', '', 5, 16500.00, 'active', 'placeholder_image_id_1747459247522', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Hinges', 'Garden pro', 'vaf', 'ITM-3214', 'Furniture & Cabinet Fittings', NULL, 149.97, 'cabinet-hinges', 'POR MAKERS', '', 4, 165.00, 'discontinued', 'placeholder_image_id_1747459381959', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'sink', 'rocell', 'fascfewavd', 'ITM-98723', '🔧 Plumbing & Sanitary', NULL, 21000.00, 'showers-bathtubs', 'Rocell', '', NULL, 25000.00, 'active', 'placeholder_image_id_1747460122623', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'gates', 'Garden pro', 'vxbdf d', 'ITM-98723', 'Garden & Outdoor', 'fencing-gates', 5999.99, 'fencing-gates', 'POR MAKERS', '', 4, 6500.00, 'active', 'placeholder_image_id_1747462637111', 'set', NULL, NULL, 'vbdsNR', 12.00, 12.00, 12.00, 12.00, 'steel', NULL, '', '', '', '', '', '', 12, NULL, NULL),
(18, 'kambi', 'lanva', 'dfrwegvs\n\nhoda kambi mewwa', 'ITM-3214', 'Building & Construction Materials', 'cladding-facades', 1000.00, 'cladding-facades', 'lanva', '', 4, 1350.00, 'active', 'placeholder_image_id_1747466112282', 'piece', NULL, NULL, 'dvsbbsf', 0.05, 12.00, 15.00, 18.00, 'steel', 9.00, '', '', '', '', '', 'ISO 9001', NULL, NULL, NULL),
(20, 'Professional Cordless Impact Driver Kit', 'PowerPro', 'High-performance 20V cordless impact driver kit with brushless motor. Includes 2 lithium-ion batteries, rapid charger, and heavy-duty carrying case. Features 3-speed settings, LED work light, and ergonomic grip for reduced fatigue during extended use.', 'TOOL-IDR220-MAX', 'Tools & Equipment', 'power-tools', 124.50, 'power-tools', 'MaxTech Tools Inc.', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747685473/products/pryinsyqagymqeyodkvi.jpg', 4, 189.99, 'active', 'products/pryinsyqagymqeyodkvi', '', NULL, NULL, '- Motor: Brushless, 20V\n- Max torque: 1800 in-lbs\n- No-load speed: 0-1000/0-2800/0-3600 RPM\n- Impact rate: 0-3600 IPM\n- Chuck size: 1/4\" hex quick-release\n- Battery: 2x 4.0Ah Li-ion\n- Charging time: 60 minutes\n- LED work light with 20-second delay\n- Variable speed trigger\n- Forward/reverse control\n- Warranty: 3 years limited', 2.80, 38.00, 30.00, 12.00, 'other', NULL, '', '20v', '', '', '', 'ISO 9001', 36, NULL, NULL),
(21, 'Premium Weather-Resistant Silicone Sealant', 'SealMaster', ' Professional-grade silicone sealant with superior weather resistance. Perfect for exterior applications including windows, doors, and roofing. Remains flexible in extreme temperatures (-50°C to +150°C). Clear finish that won\'t yellow over time.', 'SIL-WR500-CLR', 'Adhesives, Sealants & Chemicals', 'silicones', 7.50, 'silicones', 'ChemTech Industries', 'https://res.cloudinary.com/dyuyhfrch/image/upload/v1747686313/products/weq2t1xlkuaeoblknalo.png', 4, 12.99, 'active', 'products/weq2t1xlkuaeoblknalo', '', NULL, NULL, '- 300ml cartridge\n- Curing time: 24 hours\n- Temperature range: -50°C to +150°C\n- UV resistant\n- Waterproof\n- Mold and mildew resistant\n- Shelf life: 18 months unopened\n- Application temperature: 5°C to 40°C', 0.35, 5.00, 5.00, 20.00, 'other', NULL, '', '', '', '', '', 'ISO 9001', NULL, '2027-11-26', NULL),
(22, 'nut and boltd', 'lanva', '', 'ITM-5698', 'Automotive Tools & Supplies', 'car-care', 159.99, 'car-care', 'ChemTech Industries', '', 5, 200.00, 'active', 'placeholder_image_id_1747796537489', '', NULL, NULL, '', NULL, NULL, NULL, NULL, '', NULL, '', '', '', '', '', '', NULL, NULL, NULL);

--
-- Triggers `product`
--
DELIMITER $$
CREATE TRIGGER `after_product_update` AFTER UPDATE ON `product` FOR EACH ROW BEGIN
    -- Empty trigger that doesn't reference the Stock_Level column
    -- We'll handle inventory updates directly in the application code
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `store_id` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `name`, `store_id`, `created_at`) VALUES
('adhesives', 'Adhesives, Sealants & Chemicals', 1, '2025-05-17 02:58:40'),
('automotive', 'Automotive Tools & Supplies', 1, '2025-05-17 02:58:40'),
('building-materials', 'Building & Construction Materials', 1, '2025-05-17 02:58:40'),
('cleaning', 'Cleaning & Maintenance', 1, '2025-05-17 02:58:40'),
('doors-windows', 'Doors, Windows & Accessories', 1, '2025-05-17 02:58:40'),
('electrical', 'Electrical & Lighting', 1, '2025-05-17 02:58:40'),
('fasteners', 'Fasteners & Fixings', 1, '2025-05-17 02:58:40'),
('furniture-fittings', 'Furniture & Cabinet Fittings', 1, '2025-05-17 02:58:40'),
('garden', 'Garden & Outdoor', 1, '2025-05-17 02:58:40'),
('glass', 'Glass, Acrylic & Mirrors', 1, '2025-05-17 02:58:40'),
('hvac', 'Heating, Cooling & Ventilation', 1, '2025-05-17 02:58:40'),
('industrial', 'Industrial Supplies', 1, '2025-05-17 02:58:40'),
('interior-fixtures', 'Blinds, Curtains & Interior Fixtures', 1, '2025-05-17 02:58:40'),
('miscellaneous', 'Miscellaneous', 1, '2025-05-17 02:58:40'),
('paints', 'Paints & Surface Finishing', 1, '2025-05-17 02:58:40'),
('plumbing', 'Plumbing & Sanitary', 1, '2025-05-17 02:58:40'),
('safety', 'Safety, Security & Fire Protection', 1, '2025-05-17 02:58:40'),
('storage', 'Packaging, Storage & Organization', 1, '2025-05-17 02:58:40'),
('tools', 'Tools & Equipment', 1, '2025-05-17 02:58:40');

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
-- Table structure for table `product_subcategories`
--

CREATE TABLE `product_subcategories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_subcategories`
--

INSERT INTO `product_subcategories` (`id`, `name`, `category_id`, `created_at`) VALUES
('access-control', 'Access Control Systems', 'safety', '2025-05-17 02:58:40'),
('acrylic-sheets', 'Acrylic Sheets', 'glass', '2025-05-17 02:58:41'),
('air-conditioning', 'Air Conditioning Units', 'hvac', '2025-05-17 02:58:40'),
('air-filters', 'Air Filters & Purifiers', 'hvac', '2025-05-17 02:58:40'),
('air-fresheners', 'Air Fresheners', 'cleaning', '2025-05-17 02:58:41'),
('alarm-systems', 'Alarm Systems', 'safety', '2025-05-17 02:58:40'),
('anchors-plugs', 'Anchors & Wall Plugs', 'fasteners', '2025-05-17 02:58:40'),
('assembly-hardware', 'Assembly Hardware', 'furniture-fittings', '2025-05-17 02:58:40'),
('auto-fasteners', 'Automotive Fasteners', 'automotive', '2025-05-18 15:51:11'),
('auto-hand-tools', 'Hand Tools (Automotive)', 'automotive', '2025-05-18 15:51:11'),
('automotive-fasteners', 'Automotive Fasteners', 'automotive', '2025-05-17 02:58:41'),
('automotive-tools', 'Hand Tools (Automotive)', 'automotive', '2025-05-17 02:58:41'),
('battery-electrical', 'Battery & Electrical', 'automotive', '2025-05-17 02:58:41'),
('boilers', 'Boilers & Water Heaters', 'hvac', '2025-05-17 02:58:40'),
('bolts-nuts', 'Bolts & Nuts', 'fasteners', '2025-05-17 02:58:40'),
('bonding-agents', 'Specialty Bonding Agents', 'adhesives', '2025-05-17 02:58:41'),
('brackets-angles', 'Construction Brackets & Angles', 'fasteners', '2025-05-17 02:58:40'),
('bricks-blocks', 'Bricks & Blocks', 'building-materials', '2025-05-17 02:58:40'),
('brushes-rollers', 'Paint Brushes & Rollers', 'paints', '2025-05-18 15:51:11'),
('bulbs-tubes', 'Light Bulbs & Tubes', 'electrical', '2025-05-17 02:58:40'),
('cabinet-hinges', 'Cabinet Hinges', 'furniture-fittings', '2025-05-17 02:58:40'),
('cabinet-organization', 'Cabinet Organization Systems', 'furniture-fittings', '2025-05-17 02:58:40'),
('cable-ties', 'Cable Ties & Clamps', 'fasteners', '2025-05-17 02:58:40'),
('car-care', 'Car Care & Detailing', 'automotive', '2025-05-17 02:58:41'),
('caulks-sealants', 'Caulks & Sealants', 'adhesives', '2025-05-17 02:58:41'),
('ceiling-tiles', 'Ceiling Tiles & Grid Systems', 'interior-fixtures', '2025-05-17 02:58:41'),
('cement-concrete', 'Cement, Concrete & Aggregates', 'building-materials', '2025-05-17 02:58:40'),
('chair-table-hardware', 'Chair & Table Hardware', 'furniture-fittings', '2025-05-18 15:51:11'),
('chimneys-flues', 'Chimneys & Flues', 'hvac', '2025-05-17 02:58:40'),
('circuit-breakers', 'Circuit Breakers & Fuse Boxes', 'electrical', '2025-05-17 02:58:40'),
('cladding-facades', 'Cladding & Facades', 'building-materials', '2025-05-17 02:58:40'),
('cleaners-solvents', 'Cleaners & Solvents', 'adhesives', '2025-05-17 02:58:41'),
('cleaning-chemicals', 'Cleaning Chemicals', 'cleaning', '2025-05-17 02:58:41'),
('cleaning-storage', 'Storage Solutions for Cleaning Supplies', 'cleaning', '2025-05-17 02:58:41'),
('cleaning-tools', 'Cleaning Tools & Equipment', 'cleaning', '2025-05-17 02:58:41'),
('clearance', 'Clearance & Overstock', 'miscellaneous', '2025-05-17 02:58:41'),
('closet-organization', 'Closet Organization', 'storage', '2025-05-17 02:58:41'),
('concrete-additives', 'Concrete Additives', 'adhesives', '2025-05-17 02:58:41'),
('conduits-raceways', 'Conduits & Raceways', 'electrical', '2025-05-17 02:58:40'),
('construction-adhesives', 'Construction Adhesives', 'adhesives', '2025-05-17 02:58:41'),
('construction-machinery', 'Construction Machinery', 'tools', '2025-05-17 02:58:40'),
('construction-membranes', 'Construction Membranes & Barriers', 'building-materials', '2025-05-17 02:58:40'),
('curtain-rods', 'Curtain Rods & Hardware', 'interior-fixtures', '2025-05-17 02:58:41'),
('curtains', 'Curtains & Drapes', 'interior-fixtures', '2025-05-17 02:58:41'),
('curtains-drapes', 'Curtains & Drapes', 'interior-fixtures', '2025-05-18 15:51:11'),
('custom-cut', 'Custom Cut Services', 'miscellaneous', '2025-05-17 02:58:41'),
('cutting-tools', 'Cutting Tools', 'tools', '2025-05-17 02:58:40'),
('decorative-elements', 'Decorative Interior Elements', 'interior-fixtures', '2025-05-17 02:58:41'),
('decorative-finishes', 'Decorative Finishes', 'paints', '2025-05-17 02:58:40'),
('decorative-glass', 'Decorative Glass', 'glass', '2025-05-17 02:58:41'),
('decorative-hardware', 'Decorative Hardware', 'furniture-fittings', '2025-05-17 02:58:40'),
('dehumidifiers', 'Dehumidifiers & Humidifiers', 'hvac', '2025-05-17 02:58:40'),
('diagnostic-equipment', 'Diagnostic Equipment', 'automotive', '2025-05-17 02:58:41'),
('discontinued-items', 'Discontinued Items', 'miscellaneous', '2025-05-17 02:58:41'),
('disinfectants', 'Disinfectants & Sanitizers', 'cleaning', '2025-05-17 02:58:41'),
('door-closers', 'Door Closers & Controls', 'doors-windows', '2025-05-17 02:58:40'),
('door-frames', 'Door Frames & Jambs', 'doors-windows', '2025-05-17 02:58:40'),
('door-hardware', 'Door Hardware & Handles', 'doors-windows', '2025-05-17 02:58:40'),
('door-window-security', 'Door & Window Security', 'safety', '2025-05-17 02:58:40'),
('doorbells-chimes', 'Doorbells & Chimes', 'electrical', '2025-05-17 02:58:40'),
('drain-maintenance', 'Drain Maintenance', 'cleaning', '2025-05-17 02:58:41'),
('drainage-systems', 'Drainage Systems', 'plumbing', '2025-05-17 02:58:40'),
('drawer-slides', 'Drawer Slides & Runners', 'furniture-fittings', '2025-05-17 02:58:40'),
('drywall', 'Drywall & Plasterboard', 'building-materials', '2025-05-17 02:58:40'),
('ductwork-fittings', 'Ductwork & Fittings', 'hvac', '2025-05-17 02:58:40'),
('electrical-tape', 'Electrical Tape & Accessories', 'electrical', '2025-05-17 02:58:40'),
('epoxies-resins', 'Epoxies & Resins', 'adhesives', '2025-05-17 02:58:41'),
('exterior-accessories', 'Exterior Accessories', 'automotive', '2025-05-17 02:58:41'),
('exterior-doors', 'Exterior Doors', 'doors-windows', '2025-05-17 02:58:40'),
('exterior-lighting', 'Exterior Lighting Fixtures', 'electrical', '2025-05-17 02:58:40'),
('exterior-paints', 'Exterior Paints', 'paints', '2025-05-17 02:58:40'),
('fall-protection', 'Fall Protection Equipment', 'safety', '2025-05-17 02:58:40'),
('faucets-taps', 'Faucets & Taps', 'plumbing', '2025-05-17 02:58:40'),
('fencing-gates', 'Fencing & Gates', 'garden', '2025-05-17 02:58:40'),
('fire-extinguishers', 'Fire Extinguishers & Blankets', 'safety', '2025-05-17 02:58:40'),
('first-aid', 'First Aid Supplies', 'safety', '2025-05-17 02:58:40'),
('floor-care', 'Floor Care Products', 'cleaning', '2025-05-17 02:58:41'),
('flooring-underlayment', 'Flooring Underlayment', 'building-materials', '2025-05-17 02:58:40'),
('furniture-legs', 'Furniture Legs & Feet', 'furniture-fittings', '2025-05-17 02:58:40'),
('furniture-protection', 'Furniture Protection', 'furniture-fittings', '2025-05-17 02:58:40'),
('garage-doors', 'Garage Doors & Openers', 'doors-windows', '2025-05-17 02:58:40'),
('garage-organization', 'Garage Organization', 'automotive', '2025-05-17 02:58:41'),
('garage-systems', 'Garage Organization Systems', 'storage', '2025-05-17 02:58:41'),
('garden-irrigation', 'Garden Irrigation', 'garden', '2025-05-17 02:58:40'),
('garden-structures', 'Garden Structures & Arches', 'garden', '2025-05-17 02:58:40'),
('garden-tools', 'Garden Tools', 'garden', '2025-05-17 02:58:40'),
('generators', 'Generators & Power Supplies', 'electrical', '2025-05-17 02:58:40'),
('gift-cards', 'Gift Cards & Certificates', 'miscellaneous', '2025-05-17 02:58:41'),
('glass-blocks', 'Glass Blocks', 'glass', '2025-05-17 02:58:41'),
('glass-cutting', 'Glass Cutting Tools', 'glass', '2025-05-17 02:58:41'),
('glass-glazing', 'Glass & Glazing Supplies', 'doors-windows', '2025-05-17 02:58:40'),
('glass-installation', 'Glass Installation Supplies', 'glass', '2025-05-17 02:58:41'),
('glass-protection', 'Glass Protection Products', 'glass', '2025-05-17 02:58:41'),
('glass-repair', 'Glass Repair Kits', 'glass', '2025-05-17 02:58:41'),
('glass-shelving', 'Glass Shelving', 'glass', '2025-05-17 02:58:41'),
('hand-tools', 'Hand Tools', 'tools', '2025-05-17 02:58:40'),
('handles-knobs', 'Handles & Knobs', 'furniture-fittings', '2025-05-17 02:58:40'),
('heat-pumps', 'Heat Pumps', 'hvac', '2025-05-17 02:58:40'),
('heating-systems', 'Heating Systems & Radiators', 'hvac', '2025-05-17 02:58:40'),
('hvac-controls', 'HVAC Controls & Thermostats', 'hvac', '2025-05-17 02:58:40'),
('hydraulic-supplies', 'Hydraulic Supplies', 'industrial', '2025-05-17 02:58:41'),
('industrial-adhesives', 'Industrial Adhesives & Sealants', 'industrial', '2025-05-17 02:58:41'),
('industrial-chemicals', 'Industrial Chemicals', 'industrial', '2025-05-17 02:58:41'),
('industrial-hardware', 'Industrial Hardware', 'industrial', '2025-05-17 02:58:41'),
('industrial-lubricants', 'Industrial Lubricants', 'industrial', '2025-05-17 02:58:41'),
('industrial-measuring', 'Industrial Measuring Tools', 'industrial', '2025-05-17 02:58:41'),
('installation-services', 'Installation Services', 'miscellaneous', '2025-05-17 02:58:41'),
('installation-tools', 'Installation Tools & Accessories', 'interior-fixtures', '2025-05-17 02:58:41'),
('insulation', 'Insulation Materials', 'building-materials', '2025-05-17 02:58:40'),
('insulation-materials', 'Insulation Materials', 'hvac', '2025-05-17 02:58:40'),
('interior-accessories', 'Interior Accessories', 'automotive', '2025-05-17 02:58:41'),
('interior-doors', 'Interior Doors', 'doors-windows', '2025-05-17 02:58:40'),
('interior-lighting', 'Interior Lighting Fixtures', 'electrical', '2025-05-17 02:58:40'),
('interior-paints', 'Interior Paints', 'paints', '2025-05-17 02:58:40'),
('interior-trim', 'Interior Trim & Molding', 'interior-fixtures', '2025-05-17 02:58:41'),
('janitorial-supplies', 'Janitorial Supplies', 'cleaning', '2025-05-17 02:58:41'),
('junction-boxes', 'Junction Boxes & Enclosures', 'electrical', '2025-05-17 02:58:40'),
('labeling-systems', 'Labels & Marking Systems', 'storage', '2025-05-17 02:58:41'),
('labels-marking', 'Labels & Marking Systems', 'storage', '2025-05-18 15:51:11'),
('ladders-scaffolding', 'Ladders & Scaffolding', 'tools', '2025-05-17 02:58:40'),
('landscaping-materials', 'Landscaping Materials', 'garden', '2025-05-17 02:58:40'),
('lawn-maintenance', 'Lawn Maintenance Equipment', 'garden', '2025-05-17 02:58:40'),
('lifting-equipment', 'Lifting & Moving Equipment', 'tools', '2025-05-18 15:51:11'),
('lifting-moving', 'Lifting & Moving Equipment', 'tools', '2025-05-17 02:58:40'),
('locks-catches', 'Locks & Catches', 'furniture-fittings', '2025-05-17 02:58:40'),
('locks-padlocks', 'Locks & Padlocks', 'safety', '2025-05-17 02:58:40'),
('lubricants', 'Lubricants & Greases', 'adhesives', '2025-05-17 02:58:41'),
('lubricants-greases', 'Lubricants & Greases', 'adhesives', '2025-05-18 15:51:11'),
('lumber-timber', 'Lumber & Timber Products', 'building-materials', '2025-05-17 02:58:40'),
('machining-accessories', 'Machining Accessories', 'industrial', '2025-05-17 02:58:41'),
('maintenance-products', 'Maintenance Products', 'cleaning', '2025-05-17 02:58:41'),
('mastics', 'Mastics & Construction Chemicals', 'adhesives', '2025-05-17 02:58:41'),
('material-handling', 'Material Handling Equipment', 'industrial', '2025-05-17 02:58:41'),
('measuring-tools', 'Measuring & Layout Tools', 'tools', '2025-05-17 02:58:40'),
('mirrors', 'Mirrors & Mirror Accessories', 'glass', '2025-05-17 02:58:41'),
('moving-supplies', 'Moving Supplies', 'storage', '2025-05-17 02:58:41'),
('nails-brads', 'Nails & Brads', 'fasteners', '2025-05-17 02:58:40'),
('new-arrivals', 'New Arrivals', 'miscellaneous', '2025-05-17 02:58:41'),
('oils-fluids', 'Oils & Fluids', 'automotive', '2025-05-17 02:58:41'),
('outdoor-decking', 'Outdoor Decking', 'garden', '2025-05-17 02:58:40'),
('outdoor-furniture', 'Outdoor Furniture', 'garden', '2025-05-17 02:58:40'),
('outdoor-lighting', 'Outdoor Lighting', 'garden', '2025-05-17 02:58:40'),
('packaging-materials', 'Packaging Materials', 'storage', '2025-05-17 02:58:41'),
('paint-brushes', 'Paint Brushes & Rollers', 'paints', '2025-05-17 02:58:40'),
('paint-removers', 'Paint Removers & Strippers', 'paints', '2025-05-17 02:58:40'),
('paint-sprayers', 'Paint Sprayers & Accessories', 'paints', '2025-05-17 02:58:40'),
('patio-doors', 'Patio & Sliding Doors', 'doors-windows', '2025-05-17 02:58:40'),
('pest-control', 'Pest Control', 'cleaning', '2025-05-17 02:58:41'),
('pest-control-garden', 'Pest Control', 'garden', '2025-05-17 02:58:40'),
('picture-hanging', 'Picture Hanging Hardware', 'fasteners', '2025-05-17 02:58:40'),
('pipe-insulation', 'Pipe Insulation', 'plumbing', '2025-05-17 02:58:40'),
('pipes-fittings', 'Pipes & Fittings', 'plumbing', '2025-05-17 02:58:40'),
('plant-containers', 'Plant Pots & Containers', 'garden', '2025-05-17 02:58:40'),
('plumbing-accessories', 'Plumbing Accessories', 'plumbing', '2025-05-17 02:58:40'),
('pneumatic-components', 'Pneumatic Components', 'industrial', '2025-05-17 02:58:41'),
('pneumatic-tools', 'Compressors & Pneumatic Tools', 'tools', '2025-05-17 02:58:40'),
('polycarbonate', 'Polycarbonate Panels', 'glass', '2025-05-18 15:51:11'),
('polycarbonate-panels', 'Polycarbonate Panels', 'glass', '2025-05-17 02:58:41'),
('power-tools', 'Power Tools', 'tools', '2025-05-17 02:58:40'),
('ppe', 'Personal Protective Equipment', 'safety', '2025-05-17 02:58:40'),
('primers-undercoats', 'Primers & Undercoats', 'paints', '2025-05-17 02:58:40'),
('project-kits', 'Project Kits', 'miscellaneous', '2025-05-17 02:58:41'),
('protective-coatings', 'Protective Coatings', 'paints', '2025-05-17 02:58:40'),
('pumps-pressure', 'Pumps & Pressure Systems', 'plumbing', '2025-05-17 02:58:40'),
('refurbished', 'Customer Returns (Refurbished)', 'miscellaneous', '2025-05-17 02:58:41'),
('rental-equipment', 'Rental Equipment', 'miscellaneous', '2025-05-17 02:58:41'),
('rivets', 'Rivets & Rivet Tools', 'fasteners', '2025-05-17 02:58:40'),
('roofing', 'Roofing Materials', 'building-materials', '2025-05-17 02:58:40'),
('room-dividers', 'Room Dividers & Screens', 'interior-fixtures', '2025-05-17 02:58:41'),
('safes-storage', 'Safes & Secure Storage', 'safety', '2025-05-17 02:58:40'),
('safety-signs', 'Safety Signs & Labels', 'safety', '2025-05-17 02:58:40'),
('screws', 'Screws (Wood, Metal, Drywall)', 'fasteners', '2025-05-17 02:58:40'),
('seasonal-products', 'Seasonal Products', 'miscellaneous', '2025-05-17 02:58:41'),
('security-cameras', 'Security Cameras & Systems', 'safety', '2025-05-17 02:58:40'),
('shades-shutters', 'Shades & Shutters', 'interior-fixtures', '2025-05-17 02:58:41'),
('sheet-glass', 'Sheet Glass', 'glass', '2025-05-17 02:58:41'),
('shelf-supports', 'Shelf Supports & Brackets', 'furniture-fittings', '2025-05-17 02:58:40'),
('shelving-units', 'Shelving Units', 'storage', '2025-05-17 02:58:41'),
('showers-bathtubs', 'Showers & Bathtubs', 'plumbing', '2025-05-17 02:58:40'),
('silicones', 'Silicones', 'adhesives', '2025-05-17 02:58:41'),
('sinks-basins', 'Sinks & Basins', 'plumbing', '2025-05-17 02:58:40'),
('smart-lighting', 'Smart Lighting Systems', 'electrical', '2025-05-17 02:58:40'),
('smoke-detectors', 'Smoke & Carbon Monoxide Detectors', 'safety', '2025-05-17 02:58:40'),
('soil-amendments', 'Soil & Amendments', 'garden', '2025-05-17 02:58:40'),
('specialized-trade', 'Specialized Trade Tools', 'tools', '2025-05-18 15:51:11'),
('specialized-trade-tools', 'Specialized Trade Tools', 'tools', '2025-05-17 02:58:40'),
('specialty-cabinet', 'Specialty Cabinet Hardware', 'furniture-fittings', '2025-05-17 02:58:40'),
('specialty-cleaners', 'Specialty Cleaners', 'cleaning', '2025-05-17 02:58:41'),
('specialty-fasteners', 'Specialty Fasteners', 'fasteners', '2025-05-17 02:58:40'),
('specialty-hardware', 'Specialty Hardware', 'miscellaneous', '2025-05-17 02:58:41'),
('stains-varnishes', 'Stains & Varnishes', 'paints', '2025-05-17 02:58:40'),
('staples-pins', 'Staples & Pins', 'fasteners', '2025-05-17 02:58:40'),
('steel-metal', 'Steel & Metal Framing', 'building-materials', '2025-05-17 02:58:40'),
('storage-cabinets', 'Storage Cabinets', 'storage', '2025-05-17 02:58:41'),
('storage-containers', 'Storage Containers & Bins', 'storage', '2025-05-17 02:58:41'),
('storage-hooks', 'Storage Hooks & Hangers', 'storage', '2025-05-17 02:58:41'),
('structural-beams', 'Structural Beams & Supports', 'building-materials', '2025-05-17 02:58:40'),
('surface-preparation', 'Surface Preparation Tools', 'paints', '2025-05-17 02:58:40'),
('switches-outlets', 'Switches & Outlets', 'electrical', '2025-05-17 02:58:40'),
('table-hardware', 'Chair & Table Hardware', 'furniture-fittings', '2025-05-17 02:58:40'),
('tapes', 'Tapes (Duct, Masking, etc.)', 'adhesives', '2025-05-17 02:58:41'),
('technical-manuals', 'Technical Manuals & Guides', 'miscellaneous', '2025-05-17 02:58:41'),
('tempered-glass', 'Tempered & Safety Glass', 'glass', '2025-05-17 02:58:41'),
('texturing-materials', 'Texturing Materials', 'paints', '2025-05-17 02:58:40'),
('threaded-rods', 'Threaded Rods & Studs', 'fasteners', '2025-05-17 02:58:40'),
('tire-accessories', 'Tire & Wheel Accessories', 'automotive', '2025-05-17 02:58:41'),
('toilets-urinals', 'Toilets & Urinals', 'plumbing', '2025-05-17 02:58:40'),
('tool-accessories', 'Tool Accessories & Parts', 'tools', '2025-05-17 02:58:40'),
('tool-organization', 'Tool Storage & Organization', 'storage', '2025-05-17 02:58:41'),
('tool-storage', 'Tool Storage & Workbenches', 'tools', '2025-05-17 02:58:40'),
('track-systems', 'Track Systems', 'interior-fixtures', '2025-05-17 02:58:41'),
('trailer-parts', 'Trailer Parts & Accessories', 'automotive', '2025-05-17 02:58:41'),
('underfloor-heating', 'Underfloor Heating', 'hvac', '2025-05-17 02:58:40'),
('utility-carts', 'Utility Carts & Dollies', 'storage', '2025-05-17 02:58:41'),
('valves-controls', 'Valves & Controls', 'plumbing', '2025-05-17 02:58:40'),
('ventilation-fans', 'Ventilation Fans & Ducts', 'hvac', '2025-05-17 02:58:40'),
('wall-panels', 'Interior Wall Panels', 'interior-fixtures', '2025-05-17 02:58:41'),
('wallpaper-adhesives', 'Wallpaper & Adhesives', 'paints', '2025-05-17 02:58:40'),
('washers-spacers', 'Washers & Spacers', 'fasteners', '2025-05-17 02:58:40'),
('waste-disposal', 'Waste Disposal', 'cleaning', '2025-05-17 02:58:41'),
('water-filtration', 'Water Filtration & Treatment', 'plumbing', '2025-05-17 02:58:40'),
('water-heaters', 'Water Heaters', 'plumbing', '2025-05-17 02:58:40'),
('waterproofing', 'Waterproofing & Dampproofing', 'building-materials', '2025-05-17 02:58:40'),
('waterproofing-compounds', 'Waterproofing Compounds', 'adhesives', '2025-05-17 02:58:41'),
('weather-stripping', 'Weather Stripping & Seals', 'doors-windows', '2025-05-17 02:58:40'),
('welding-equipment', 'Welding Equipment', 'tools', '2025-05-17 02:58:40'),
('welding-supplies', 'Welding Supplies', 'industrial', '2025-05-17 02:58:41'),
('window-blinds', 'Window Blinds', 'interior-fixtures', '2025-05-17 02:58:41'),
('window-films', 'Window Films & Tints', 'interior-fixtures', '2025-05-17 02:58:41'),
('window-frames', 'Window Frames', 'doors-windows', '2025-05-17 02:58:40'),
('window-hardware', 'Window Hardware', 'doors-windows', '2025-05-17 02:58:40'),
('windows', 'Windows (Various Types)', 'doors-windows', '2025-05-17 02:58:40'),
('wiring-cables', 'Wiring & Cables', 'electrical', '2025-05-17 02:58:40'),
('wood-glues', 'Wood Glues', 'adhesives', '2025-05-17 02:58:41'),
('workshop-equipment', 'Workshop Equipment', 'automotive', '2025-05-17 02:58:41'),
('workshop-machinery', 'Workshop Machinery', 'industrial', '2025-05-17 02:58:41'),
('workshop-storage', 'Workshop Storage', 'storage', '2025-05-17 02:58:41'),
('workwear-safety', 'Workwear & Safety Gear', 'industrial', '2025-05-17 02:58:41');

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
(2, 'FLASH SALE', 40.00, '2025-03-27', '2025-03-27', 3, 'FLASH_SALE', 1, NULL, NULL, 1),
(3, 'HAMMER COMBO', NULL, '2023-11-01', '2023-12-15', 2, 'BOGO', 1, 5, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed','free_shipping','bogo') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_uses` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `applies_to` enum('all','categories','products') DEFAULT 'all',
  `buy_quantity` int(11) DEFAULT NULL,
  `category_ids` longtext DEFAULT NULL,
  `code_case_sensitive` varchar(100) DEFAULT NULL,
  `customer_description` text DEFAULT NULL,
  `distribution_channel` varchar(50) DEFAULT 'online',
  `get_quantity` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `one_time_use` tinyint(1) DEFAULT NULL,
  `product_ids` longtext DEFAULT NULL,
  `promotion_type` varchar(50) DEFAULT NULL,
  `segment_id` varchar(100) DEFAULT NULL,
  `trigger_type` varchar(50) DEFAULT 'cart_based',
  `usage_limit` int(11) DEFAULT NULL,
  `usage_limit_per_user` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_categories`
--

CREATE TABLE `promotion_categories` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) NOT NULL,
  `category_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_products`
--

CREATE TABLE `promotion_products` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_usage`
--

CREATE TABLE `promotion_usage` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `po_number` varchar(50) NOT NULL,
  `order_date` datetime NOT NULL DEFAULT current_timestamp(),
  `expected_delivery_date` datetime DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `shipping_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('draft','pending','sent','confirmed','canceled') NOT NULL DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_by_name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `sent_to` varchar(100) DEFAULT NULL,
  `confirmed_date` datetime DEFAULT NULL,
  `canceled_by` int(11) DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `confirmed_by` int(11) DEFAULT NULL,
  `confirm_notes` text DEFAULT NULL,
  `received_date` datetime DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `is_partially_fulfilled` tinyint(1) DEFAULT 0,
  `fulfillment_status` varchar(20) DEFAULT 'not_fulfilled',
  `partial_fulfillment_date` datetime DEFAULT NULL,
  `partial_fulfillment_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `order_date`, `expected_delivery_date`, `supplier_id`, `subtotal`, `tax_rate`, `tax_amount`, `shipping_cost`, `total_amount`, `status`, `notes`, `created_by`, `created_by_name`, `created_at`, `updated_at`, `updated_by`, `sent_date`, `sent_to`, `confirmed_date`, `canceled_by`, `canceled_at`, `cancellation_reason`, `confirmed_by`, `confirm_notes`, `received_date`, `payment_terms`, `is_partially_fulfilled`, `fulfillment_status`, `partial_fulfillment_date`, `partial_fulfillment_notes`) VALUES
(19, 'PO-559739', '2025-05-17 00:00:00', '2027-05-29 00:00:00', 4, 1350.00, 0.00, 0.00, 0.00, 1350.00, 'confirmed', 'meka thmi mata oni stock eka', NULL, NULL, '2025-05-17 21:27:54', '2025-05-18 23:20:28', NULL, NULL, 'businesstharindu30@gmail.com', '2025-05-18 23:20:28', NULL, '2025-05-18 23:14:38', 'asfgwggwrhtdnyjryht', NULL, 'me badu mata awa', '2025-05-18 17:50:28', 'Net 30 days', 0, 'not_fulfilled', NULL, NULL),
(20, 'PO-165734', '2025-05-17 00:00:00', '2025-05-23 00:00:00', 4, 20798.00, 0.00, 0.00, 0.00, 20798.00, 'canceled', 'ksdd vfjknjniwhfbeab', NULL, NULL, '2025-05-17 22:24:09', '2025-05-18 21:03:23', NULL, NULL, 'businesstharindu30@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'not_fulfilled', NULL, NULL),
(21, 'PO-683135', '2025-05-17 00:00:00', '2025-06-19 00:00:00', 4, 7999.00, 0.00, 0.00, 0.00, 7999.00, 'confirmed', 'xcnkv fkb klfdfnblkdbgfntn', NULL, NULL, '2025-05-18 04:03:22', '2025-05-18 06:13:49', NULL, NULL, 'businesstharindu30@gmail.com', '2025-05-18 06:13:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'not_fulfilled', NULL, NULL),
(22, 'PO-307808', '2025-05-18 00:00:00', '2025-08-31 00:00:00', 6, 200000.00, 0.50, 1000.00, 0.00, 201000.00, 'confirmed', 'wvbwvsdbrgv', NULL, NULL, '2025-05-18 21:39:00', '2025-05-18 23:13:11', NULL, NULL, 'atharindu788@gmail.com', '2025-05-18 23:13:11', NULL, '2025-05-18 23:00:35', 'meka hoda madi', NULL, 'nv nbjnwjsvgnjngjwjsnvd ', NULL, 'Net 30 days', 0, 'not_fulfilled', NULL, NULL),
(23, 'PO-664861', '2025-05-18 00:00:00', '2025-06-29 00:00:00', 6, 65000.00, 0.00, 0.00, 0.00, 65000.00, 'confirmed', 'dsvsbwdfvfd', NULL, NULL, '2025-05-18 23:23:20', '2025-05-18 23:25:54', NULL, NULL, 'atharindu788@gmail.com', '2025-05-18 23:25:54', NULL, NULL, NULL, NULL, 'hgchgbjkgfycfvbjhjb hb ', '2025-05-18 17:55:54', 'Net 30 days', 0, 'not_fulfilled', NULL, NULL),
(24, 'PO-691624', '2025-05-18 00:00:00', '2025-05-30 00:00:00', 6, 62475.00, 0.00, 0.00, 0.00, 62475.00, 'confirmed', 'vsvxvdsv', NULL, NULL, '2025-05-19 00:10:54', '2025-05-19 00:11:25', NULL, NULL, 'atharindu788@gmail.com', '2025-05-19 00:11:25', NULL, NULL, NULL, NULL, NULL, '2025-05-18 18:41:25', 'Net 30 days', 0, 'not_fulfilled', NULL, NULL),
(25, 'PO-617886', '2025-05-18 00:00:00', '2025-07-10 00:00:00', 6, 44975.00, 0.00, 0.00, 0.00, 44975.00, 'confirmed', 'avgsrgbrfesre', NULL, NULL, '2025-05-19 00:29:39', '2025-05-19 01:06:31', NULL, NULL, 'atharindu788@gmail.com', '2025-05-19 01:06:31', NULL, NULL, NULL, NULL, 'vng gfnbdfb', '2025-05-18 19:36:31', 'Net 30 days', 1, 'partially_fulfilled', NULL, NULL),
(26, 'PO-842278', '2025-05-18 00:00:00', '2025-05-30 00:00:00', 5, 1500.00, 10.00, 150.00, 0.00, 1650.00, 'draft', 'Auto-generated from low stock item: Wall Plugs. Current stock: 0, Reorder level: 500.', NULL, NULL, '2025-05-19 05:06:28', '2025-05-19 05:06:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'not_fulfilled', NULL, NULL),
(27, 'PO-275978', '2025-05-21 00:00:00', '2025-05-30 00:00:00', 6, 1200.00, 0.00, 0.00, 0.00, 1200.00, 'sent', 'dsvsdvsv', NULL, NULL, '2025-05-21 09:06:01', '2025-05-21 09:07:13', NULL, NULL, 'atharindu788@gmail.com', '2025-05-21 09:06:37', NULL, NULL, NULL, NULL, 'jbjjn', '2025-05-21 03:36:37', 'Net 30 days', 1, 'partially_fulfilled', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `received_quantity` int(11) DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `product_id`, `product_name`, `sku`, `description`, `quantity`, `unit_price`, `total`, `created_at`, `received_quantity`, `received_at`, `received_by`, `status`) VALUES
(9, 19, 18, 'kambi', 'ITM-3214', NULL, 1, 1350.00, 1350.00, '2025-05-17 21:27:54', NULL, NULL, NULL, 'pending'),
(10, 20, 3, 'Adjustable Wrench', NULL, NULL, 1, 1799.00, 1799.00, '2025-05-17 22:24:09', NULL, NULL, NULL, 'pending'),
(11, 20, 4, 'Circular Saw', NULL, NULL, 1, 18999.00, 18999.00, '2025-05-17 22:24:09', NULL, NULL, NULL, 'pending'),
(12, 21, 10, 'Work Boots', NULL, NULL, 1, 7999.00, 7999.00, '2025-05-18 04:03:22', NULL, NULL, NULL, 'pending'),
(13, 22, 18, 'kambi', 'ITM-3214', NULL, 100, 1350.00, 135000.00, '2025-05-18 21:39:00', NULL, NULL, NULL, 'pending'),
(14, 22, 17, 'gates', 'ITM-98723', NULL, 10, 6500.00, 65000.00, '2025-05-18 21:39:00', NULL, NULL, NULL, 'pending'),
(15, 23, 17, 'gates', 'ITM-98723', NULL, 10, 6500.00, 65000.00, '2025-05-18 23:23:20', NULL, NULL, NULL, 'pending'),
(16, 24, 2, 'Claw Hammer', NULL, NULL, 25, 2499.00, 62475.00, '2025-05-19 00:10:54', NULL, NULL, NULL, 'pending'),
(17, 25, 3, 'Adjustable Wrench', NULL, NULL, 25, 1799.00, 44975.00, '2025-05-19 00:29:39', NULL, NULL, NULL, 'pending'),
(18, 26, 12, 'Wall Plugs', 'ITM-12345', 'Wall Plugs - ITM-12345', 600, 2.50, 1500.00, '2025-05-19 05:06:28', NULL, NULL, NULL, 'pending'),
(19, 27, 3, 'Adjustable Wrench', 'ITM-22213', NULL, 1, 1200.00, 1200.00, '2025-05-21 09:06:01', NULL, NULL, NULL, 'pending');

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

--
-- Dumping data for table `sales_transaction`
--

INSERT INTO `sales_transaction` (`transaction_id`, `order_id`, `transaction_date`, `amount`, `transaction_type`, `payment_method`, `account_id`, `reference_number`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, '2024-03-15 00:00:00', 259.98, 'SALE', NULL, NULL, 'ORD-1', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(2, 2, '2024-03-20 00:00:00', 199.99, 'SALE', NULL, NULL, 'ORD-2', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(3, 3, '2024-03-22 00:00:00', 139.98, 'SALE', NULL, NULL, 'ORD-3', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(4, 7, '2025-05-19 11:11:29', 49295.00, 'SALE', 'payhere', NULL, 'ORD-7', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(5, 8, '2025-05-19 11:11:29', 49295.00, 'SALE', 'payhere', NULL, 'ORD-8', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(6, 9, '2025-05-19 11:11:29', 13495.00, 'SALE', 'payhere', NULL, 'ORD-9', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(7, 10, '2025-05-19 11:11:29', 16789.00, 'SALE', 'payhere', NULL, 'ORD-10', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(8, 12, '2025-05-19 11:11:29', 41496.00, 'SALE', 'payhere', NULL, 'ORD-12', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(9, 101, '2025-04-01 00:00:00', 12000.00, 'SALE', NULL, NULL, 'ORD-101', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(10, 102, '2025-04-15 00:00:00', 18500.00, 'SALE', NULL, NULL, 'ORD-102', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(11, 103, '2025-05-01 00:00:00', 25000.00, 'SALE', NULL, NULL, 'ORD-103', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(12, 104, '2025-05-10 00:00:00', 9800.00, 'SALE', NULL, NULL, 'ORD-104', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(13, 2001, '2025-04-01 00:00:00', 12000.00, 'SALE', NULL, NULL, 'ORD-2001', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(14, 2002, '2025-04-15 00:00:00', 18500.00, 'SALE', NULL, NULL, 'ORD-2002', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(15, 2003, '2025-05-01 00:00:00', 25000.00, 'SALE', NULL, NULL, 'ORD-2003', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(16, 2004, '2025-05-10 00:00:00', 9800.00, 'SALE', NULL, NULL, 'ORD-2004', NULL, NULL, '2025-05-20 01:42:50', '2025-05-20 01:42:50');

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
(1, 'Kaushalya ', 'Wickramasinghe', '0123456789', NULL, '$2b$12$kQ9fdx85n8QNnGnbw2MhBOKDPIUUxS2MMP4WSloz.XlYU89TkO.le', NULL, NULL, 'gaming123@gmail.com', 'manager', 'active', 2, '2025-04-30 02:15:52', '2025-05-06 19:30:47'),
(4, 'Lakshitha', 'Sampath', '0711234567', NULL, '$2b$12$6w7FT8tOXT5iEUcvYGjep.iArIMo0oLWQ.VkJ7MeMD8lc7fwFjwji', NULL, NULL, 'lakshitha@gmail.com', 'manager', 'deleted', 2, '2025-05-06 20:18:10', '2025-05-06 20:18:40'),
(47217, 'kanishka', 'dilhan', '0717577400', NULL, '$2b$12$eNq6cgRdnJxh24..me7dR.JUHpwzIOnHAChUb/zs7YNxA3eMmEYTa', NULL, NULL, 'kanishka@yoursystem.com', 'staff', 'active', 2, '2025-04-30 00:53:26', '2025-04-30 00:53:26'),
(47218, 'Manel', 'Sooriyaarachchi', '0712128692', NULL, '$2b$12$smiXMcjEz9IhQiQbH11uH.m31aHh7ToOjOkZZGNdMHiF4IbQHkNlK', NULL, NULL, 'manel@gmail.com', 'staff', 'active', 2, '2025-05-06 20:00:58', '2025-05-06 20:00:58');

-- --------------------------------------------------------

--
-- Table structure for table `staff_notifications`
--

CREATE TABLE `staff_notifications` (
  `notification_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `message_id` int(11) DEFAULT NULL,
  `type` enum('NEW_THREAD','NEW_MESSAGE') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `stock_movement`
--

INSERT INTO `stock_movement` (`movement_id`, `product_id`, `quantity_change`, `movement_type`, `movement_date`, `reference_id`, `notes`, `created_by`, `previous_quantity`, `new_quantity`) VALUES
(12, 18, 100, 'PURCHASE', '2025-05-18 17:43:11', 'PO-1747590191104', 'Purchase Order #New', NULL, 900, 1000),
(13, 17, 10, 'PURCHASE', '2025-05-18 17:43:11', 'PO-1747590191117', 'Purchase Order #New', NULL, 30, 40),
(14, 18, 100, '', '2025-05-18 17:43:11', NULL, 'Received from purchase order', NULL, 900, 1000),
(15, 17, 10, '', '2025-05-18 17:43:11', NULL, 'Received from purchase order', NULL, 30, 40),
(16, 18, 1, 'PURCHASE', '2025-05-18 17:50:29', 'PO-1747590629035', 'Purchase Order #New', NULL, 1001, 1002),
(17, 18, 1, '', '2025-05-18 17:50:29', NULL, 'Received from purchase order', NULL, 1001, 1002),
(18, 17, 10, 'PURCHASE', '2025-05-18 17:55:54', 'PO-1747590954320', 'Purchase Order #New', NULL, 50, 60),
(19, 17, 10, '', '2025-05-18 17:55:54', NULL, 'Received from purchase order', NULL, 50, 60),
(20, 2, 25, 'PURCHASE', '2025-05-18 18:41:25', 'PO-1747593685206', 'Purchase Order #New', NULL, 25, 50),
(21, 2, 25, '', '2025-05-18 18:41:25', NULL, 'Received from purchase order', NULL, 25, 50),
(22, 3, 25, 'PURCHASE', '2025-05-18 19:24:24', 'PO-1747596264692', 'Purchase Order #New', NULL, 25, 50),
(23, 3, 20, '', '2025-05-18 19:36:31', NULL, 'PARTIAL fulfillment: Received 20 of 25 ordered units', NULL, 0, 20),
(58, 2, 10, '', '2025-05-19 02:25:29', NULL, 'Test movement for debugging', NULL, 0, 10),
(1000, 2, -2, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #101', NULL, 50, 48),
(1001, 3, -1, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #101', NULL, 50, 49),
(1002, 5, -6, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #101', NULL, 50, 44),
(1003, 4, -1, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #102', NULL, 50, 49),
(1004, 7, -1, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #103', NULL, 50, 49),
(1005, 8, -2, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #104', NULL, 50, 48),
(1006, 10, -1, 'SALE', '2025-05-19 05:27:57', NULL, 'Sale for Order #104', NULL, 50, 49),
(2000, 2, -2, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2001', NULL, 50, 48),
(2001, 3, -1, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2001', NULL, 50, 49),
(2002, 5, -6, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2001', NULL, 50, 44),
(2003, 4, -1, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2002', NULL, 50, 49),
(2004, 7, -1, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2003', NULL, 50, 49),
(2005, 8, -2, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2004', NULL, 50, 48),
(2006, 10, -1, 'SALE', '2025-05-19 05:33:34', NULL, 'Sale for Order #2004', NULL, 50, 49),
(2007, 3, 1, '', '2025-05-21 03:36:37', NULL, 'COMPLETE fulfillment: Received 1 of 1 ordered units', NULL, 0, 1);

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
  `street` varchar(100) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`Supplier_ID`, `Name`, `Contact_Person`, `Email`, `Phone_Number`, `street`, `city`, `state`, `zipCode`, `country`, `created_at`, `updated_at`) VALUES
(4, 'Tharindu Lalanath Ananda', 'Tharindu Lalanath Ananda', 'businesstharindu30@gmail.com', '0123456789', '100/1', 'rakwana', 'Sabaragamauwa', '70300', 'Sri Lanka', '2025-05-05 20:43:23', '2025-05-17 14:35:52'),
(5, 'kanishka dilhan', 'kanishka dilhan', 'dilhan@gmail.com', '0717577400', '100/1', 'rakwana', 'Sabaragamauwa', '70300', 'Sri Lanka', '2025-05-05 21:07:22', '2025-05-05 21:07:22'),
(6, 'Multilac', 'Venuja Prasanjith', 'atharindu788@gmail.com', '071 2345678', 'dbssn', ' dnnb ', 'nFDd z', '70100', 'Sri Lanka', '2025-05-18 16:06:50', '2025-05-18 16:06:50');

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
-- Table structure for table `supplier_product`
--

CREATE TABLE `supplier_product` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier_product`
--

INSERT INTO `supplier_product` (`id`, `supplier_id`, `product_id`, `created_at`) VALUES
(4, 4, 4, '2025-05-17 14:35:52'),
(5, 6, 18, '2025-05-18 16:06:50'),
(6, 6, 17, '2025-05-18 16:06:50'),
(7, 6, 15, '2025-05-18 16:06:50');

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

--
-- Dumping data for table `tax_rate`
--

INSERT INTO `tax_rate` (`tax_id`, `tax_name`, `tax_rate`, `tax_type`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Standard Sales Tax', 8.500, 'PERCENTAGE', 1, 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(2, 'Reduced Rate', 5.000, 'PERCENTAGE', 0, 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(3, 'Zero Rate', 0.000, 'PERCENTAGE', 0, 1, '2025-05-20 01:42:50', '2025-05-20 01:42:50'),
(4, 'Standard Sales Tax', 8.500, 'PERCENTAGE', 1, 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18'),
(5, 'Reduced Rate', 5.000, 'PERCENTAGE', 0, 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18'),
(6, 'Zero Rate', 0.000, 'PERCENTAGE', 0, 1, '2025-05-20 01:48:18', '2025-05-20 01:48:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Username` (`NAME`),
  ADD KEY `idx_customer_email` (`EMAIL`),
  ADD KEY `idx_customer_phone` (`PHONE_NUM`);

--
-- Indexes for table `customerorder`
--
ALTER TABLE `customerorder`
  ADD PRIMARY KEY (`Order_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`),
  ADD KEY `customerorder_ibfk_2` (`Staff_ID`),
  ADD KEY `idx_order_date` (`Order_Date`),
  ADD KEY `idx_order_status` (`Delivery_Status`);

--
-- Indexes for table `customer_address`
--
ALTER TABLE `customer_address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `customer_segment`
--
ALTER TABLE `customer_segment`
  ADD PRIMARY KEY (`segment_id`);

--
-- Indexes for table `email_campaigns`
--
ALTER TABLE `email_campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_campaign_batches`
--
ALTER TABLE `email_campaign_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`);

--
-- Indexes for table `email_campaign_logs`
--
ALTER TABLE `email_campaign_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`);

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
  ADD KEY `Supplier_ID` (`Supplier_ID`),
  ADD KEY `idx_inventory_product_id` (`Product_ID`);

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
-- Indexes for table `loyalty_points_transactions`
--
ALTER TABLE `loyalty_points_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `loyalty_rewards`
--
ALTER TABLE `loyalty_rewards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loyalty_settings`
--
ALTER TABLE `loyalty_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_id` (`store_id`);

--
-- Indexes for table `loyalty_tiers`
--
ALTER TABLE `loyalty_tiers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `marketing_campaigns`
--
ALTER TABLE `marketing_campaigns`
  ADD PRIMARY KEY (`campaign_id`),
  ADD KEY `status` (`status`),
  ADD KEY `scheduled_date` (`scheduled_date`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `target_segment` (`target_segment`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `thread_id` (`thread_id`);

--
-- Indexes for table `message_threads`
--
ALTER TABLE `message_threads`
  ADD PRIMARY KEY (`thread_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`);

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
  ADD KEY `Supplier_ID` (`Supplier_ID`),
  ADD KEY `idx_product_category` (`Category`),
  ADD KEY `idx_product_status` (`Status`),
  ADD KEY `idx_product_category_id` (`subcategory_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_changes`
--
ALTER TABLE `product_changes`
  ADD PRIMARY KEY (`Product_Change_ID`),
  ADD KEY `Supplier_ID` (`Supplier_ID`),
  ADD KEY `Store_Manager_ID` (`Store_Manager_ID`);

--
-- Indexes for table `product_subcategories`
--
ALTER TABLE `product_subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

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
  ADD KEY `free_product_id` (`free_product_id`),
  ADD KEY `idx_promotion_active` (`is_active`),
  ADD KEY `idx_promotion_dates` (`Start_Date`,`End_Date`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_id` (`store_id`,`code`),
  ADD UNIQUE KEY `code_case_sensitive` (`code_case_sensitive`);

--
-- Indexes for table `promotion_categories`
--
ALTER TABLE `promotion_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promotion_id` (`promotion_id`,`category_id`);

--
-- Indexes for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promotion_id` (`promotion_id`,`product_id`);

--
-- Indexes for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_id` (`promotion_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `idx_po_number` (`po_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_supplier` (`supplier_id`),
  ADD KEY `idx_order_date` (`order_date`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_order` (`purchase_order_id`),
  ADD KEY `idx_product` (`product_id`);

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
-- Indexes for table `staff_notifications`
--
ALTER TABLE `staff_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `thread_id` (`thread_id`),
  ADD KEY `message_id` (`message_id`);

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
-- Indexes for table `supplier_product`
--
ALTER TABLE `supplier_product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_supplier_product` (`supplier_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `customerorder`
--
ALTER TABLE `customerorder`
  MODIFY `Order_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2024;

--
-- AUTO_INCREMENT for table `customer_address`
--
ALTER TABLE `customer_address`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_segment`
--
ALTER TABLE `customer_segment`
  MODIFY `segment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_campaigns`
--
ALTER TABLE `email_campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_campaign_logs`
--
ALTER TABLE `email_campaign_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `Expense_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `expense_category`
--
ALTER TABLE `expense_category`
  MODIFY `Expense_Category_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `expense_payment`
--
ALTER TABLE `expense_payment`
  MODIFY `Expense_Payment_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `Feedback_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `financial_account`
--
ALTER TABLE `financial_account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `Inventory_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
-- AUTO_INCREMENT for table `loyalty_rewards`
--
ALTER TABLE `loyalty_rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `loyalty_settings`
--
ALTER TABLE `loyalty_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `loyalty_tiers`
--
ALTER TABLE `loyalty_tiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_threads`
--
ALTER TABLE `message_threads`
  MODIFY `thread_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `Order_Item_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2044;

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
  MODIFY `Product_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_categories`
--
ALTER TABLE `promotion_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_products`
--
ALTER TABLE `promotion_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `sales_transaction`
--
ALTER TABLE `sales_transaction`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `Staff_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47219;

--
-- AUTO_INCREMENT for table `staff_notifications`
--
ALTER TABLE `staff_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movement`
--
ALTER TABLE `stock_movement`
  MODIFY `movement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2008;

--
-- AUTO_INCREMENT for table `store_manager`
--
ALTER TABLE `store_manager`
  MODIFY `Store_Manager_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `Supplier_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  MODIFY `Supplier_Inventory_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier_product`
--
ALTER TABLE `supplier_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `support_ticket`
--
ALTER TABLE `support_ticket`
  MODIFY `ticket_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_rate`
--
ALTER TABLE `tax_rate`
  MODIFY `tax_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Constraints for table `customer_address`
--
ALTER TABLE `customer_address`
  ADD CONSTRAINT `customer_address_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `email_campaign_batches`
--
ALTER TABLE `email_campaign_batches`
  ADD CONSTRAINT `email_campaign_batches_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_campaign_logs`
--
ALTER TABLE `email_campaign_logs`
  ADD CONSTRAINT `email_campaign_logs_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `loyalty_points_transactions`
--
ALTER TABLE `loyalty_points_transactions`
  ADD CONSTRAINT `loyalty_points_transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`thread_id`) ON DELETE CASCADE;

--
-- Constraints for table `message_threads`
--
ALTER TABLE `message_threads`
  ADD CONSTRAINT `message_threads_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_threads_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`Staff_ID`) ON DELETE SET NULL;

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
-- Constraints for table `product_subcategories`
--
ALTER TABLE `product_subcategories`
  ADD CONSTRAINT `product_subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `promotion_categories`
--
ALTER TABLE `promotion_categories`
  ADD CONSTRAINT `promotion_categories_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD CONSTRAINT `promotion_products_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  ADD CONSTRAINT `promotion_usage_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`) ON DELETE SET NULL;

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
-- Constraints for table `staff_notifications`
--
ALTER TABLE `staff_notifications`
  ADD CONSTRAINT `staff_notifications_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`Staff_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_notifications_ibfk_2` FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`thread_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_notifications_ibfk_3` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE;

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
-- Constraints for table `supplier_product`
--
ALTER TABLE `supplier_product`
  ADD CONSTRAINT `supplier_product_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`Supplier_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplier_product_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`Product_ID`) ON DELETE CASCADE;

--
-- Constraints for table `support_ticket`
--
ALTER TABLE `support_ticket`
  ADD CONSTRAINT `support_ticket_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_ticket_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `customerorder` (`Order_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_ticket_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`Staff_ID`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
