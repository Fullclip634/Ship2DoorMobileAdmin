-- Ship2Door Database Schema
-- Database: ship_2_door

CREATE DATABASE IF NOT EXISTS ship_2_door;
USE ship_2_door;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    profile_photo VARCHAR(500),
    push_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIPS TABLE
-- ============================================================
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    direction ENUM('manila_to_bohol', 'bohol_to_manila') NOT NULL,
    departure_date DATE NOT NULL,
    estimated_arrival DATE,
    status ENUM('upcoming', 'pickup_phase', 'in_transit', 'boarding_ship', 'at_sea', 'arrived', 'delivering', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
    delay_reason TEXT,
    notes TEXT,
    max_capacity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    trip_id INT NOT NULL,
    customer_id INT NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    weight_estimate VARCHAR(50),
    special_instructions TEXT,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100),
    pickup_street VARCHAR(255),
    pickup_purok VARCHAR(100),
    pickup_barangay VARCHAR(100),
    pickup_province VARCHAR(100),
    pickup_zip_code VARCHAR(10),
    pickup_landmark TEXT,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_street VARCHAR(255),
    delivery_purok VARCHAR(100),
    delivery_barangay VARCHAR(100),
    delivery_province VARCHAR(100),
    delivery_zip_code VARCHAR(10),
    delivery_landmark TEXT,
    receiver_name VARCHAR(200) NOT NULL,
    receiver_phone VARCHAR(20),
    receiver_fb_name VARCHAR(200),
    sender_name VARCHAR(200),
    sender_phone VARCHAR(20),
    status ENUM('pending', 'confirmed', 'pickup_scheduled', 'picked_up', 'in_transit', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    pickup_date DATE,
    pickup_time_slot VARCHAR(50),
    delivery_photo VARCHAR(500),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('trip_update', 'order_update', 'pickup_schedule', 'delay', 'announcement', 'general') NOT NULL DEFAULT 'general',
    reference_id INT,
    reference_type ENUM('trip', 'order', 'announcement', 'ticket'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TICKETS TABLE (Support ticket system)
-- ============================================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    category ENUM('order_issue','delivery_problem','payment','general_inquiry','app_bug') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
    priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    related_order_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================================
-- TICKET MESSAGES TABLE
-- ============================================================
CREATE TABLE ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('customer','admin') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- DEFAULT ADMIN ACCOUNT
-- ============================================================
-- Password: admin123 (bcrypt hash, cost 10)
-- Alternatively, run: node backend/seed.js
INSERT INTO users (role, first_name, last_name, email, phone, password, address, city, province)
VALUES ('admin', 'Ship2Door', 'Admin', 'admin@ship2door.com', '09171234567', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tagbilaran City', 'Tagbilaran', 'Bohol');
