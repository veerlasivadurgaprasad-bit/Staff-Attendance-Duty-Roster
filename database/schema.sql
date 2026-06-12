-- MySQL Schema for "Staff Attendance & Duty Roster" for FirstCry Intellitots

CREATE DATABASE IF NOT EXISTS firstcry_intellitots_roster;
USE firstcry_intellitots_roster;

-- 1. Users table (for authentication & roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Centre Head', 'Teacher', 'Helper') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Staff table (extends user profiles with shifts and details)
CREATE TABLE IF NOT EXISTS staff (
    staff_id VARCHAR(50) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shift ENUM('Morning Shift (08:00 AM - 02:00 PM)', 'General Shift (09:00 AM - 05:00 PM)', 'Afternoon Shift (12:00 PM - 06:00 PM)', 'Daycare Shift (10:00 AM - 07:00 PM)') NOT NULL,
    status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    classroom_name VARCHAR(100) NOT NULL UNIQUE,
    teacher_id VARCHAR(50) NULL,
    helper_id VARCHAR(50) NULL,
    capacity INT DEFAULT 15,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (teacher_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (helper_id) REFERENCES staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    attendance_status ENUM('Present', 'Absent', 'Leave', 'Half Day') NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_date (staff_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Duty Roster table
CREATE TABLE IF NOT EXISTS duty_roster (
    roster_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL,
    classroom_id INT NOT NULL,
    shift ENUM('Morning Shift (08:00 AM - 02:00 PM)', 'General Shift (09:00 AM - 05:00 PM)', 'Afternoon Shift (12:00 PM - 06:00 PM)', 'Daycare Shift (10:00 AM - 07:00 PM)') NOT NULL,
    assigned_date DATE NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_date_roster (staff_id, assigned_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tasks table (Daycare tasks, checklists, etc.)
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    assigned_to VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    due_date DATE NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (assigned_to) REFERENCES staff(staff_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Attendance', 'Shift Alert', 'Duty Change', 'Announcement') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_roster_date ON duty_roster(assigned_date);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);


-- ==========================================
-- DUMMY SEED DATA FOR TESTING
-- ==========================================

-- Admin password hash: 'admin123' (will be hashed with bcrypt in application)
-- Centre Head password: 'head123'
-- Teacher password: 'teacher123'
-- Helper password: 'helper123'

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Admin'),
(2, 'Priya Sharma', 'priya.sharma@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Centre Head'),
(3, 'Ananya Sen', 'ananya.sen@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Teacher'),
(4, 'Meera Nair', 'meera.nair@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Teacher'),
(5, 'Sita Devi', 'sita.devi@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Helper'),
(6, 'Rani Mukherji', 'rani.m@firstcry.com', '$2a$10$xG/B5R5W0qO9b4/gqP4BKe/4aBwV0zNCO8e3F39z3T/cT.N4D4.X6', 'Helper');

INSERT INTO staff (staff_id, user_id, designation, department, phone, shift, status) VALUES
('T-001', 3, 'Toddler Lead Teacher', 'Early Years', '9876543210', 'Morning Shift (08:00 AM - 02:00 PM)', 'Active'),
('T-002', 4, 'Preschool Teacher', 'Preschool', '9876543211', 'General Shift (09:00 AM - 05:00 PM)', 'Active'),
('H-001', 5, 'Classroom Attendant', 'Daycare Support', '9876543212', 'Morning Shift (08:00 AM - 02:00 PM)', 'Active'),
('H-002', 6, 'Daycare Helper', 'Daycare Support', '9876543213', 'Daycare Shift (10:00 AM - 07:00 PM)', 'Active');

INSERT INTO classrooms (classroom_id, classroom_name, teacher_id, helper_id, capacity, status) VALUES
(1, 'Playgroup - Nestling', 'T-001', 'H-001', 12, 'Active'),
(2, 'Nursery - Fledglings', 'T-002', 'H-002', 15, 'Active'),
(3, 'Daycare - Cozy Cabin', NULL, NULL, 20, 'Active');

-- Current and past attendance entries (Assuming current system date is 2026-06-12)
INSERT INTO attendance (staff_id, date, check_in, check_out, attendance_status) VALUES
('T-001', '2026-06-11', '07:55:00', '14:05:00', 'Present'),
('T-002', '2026-06-11', '08:58:00', '17:02:00', 'Present'),
('H-001', '2026-06-11', '08:10:00', '14:00:00', 'Present'),
('H-002', '2026-06-11', NULL, NULL, 'Absent'),
('T-001', '2026-06-12', '07:52:00', NULL, 'Present'),
('T-002', '2026-06-12', '09:05:00', NULL, 'Present'),
('H-001', '2026-06-12', NULL, NULL, 'Leave');

-- Duty Roster entries
INSERT INTO duty_roster (staff_id, classroom_id, shift, assigned_date) VALUES
('T-001', 1, 'Morning Shift (08:00 AM - 02:00 PM)', '2026-06-12'),
('T-002', 2, 'General Shift (09:00 AM - 05:00 PM)', '2026-06-12'),
('H-001', 1, 'Morning Shift (08:00 AM - 02:00 PM)', '2026-06-12'),
('H-002', 3, 'Daycare Shift (10:00 AM - 07:00 PM)', '2026-06-12');

-- Daycare Tasks
INSERT INTO tasks (assigned_to, title, description, priority, due_date, status) VALUES
('T-001', 'Sanitize Learning Material', 'Disinfect all wooden blocks and sensory play materials in the Nursery classroom.', 'High', '2026-06-12', 'Pending'),
('T-002', 'Prepare Weekly Lesson Plan', 'Upload lesson plan for Next Week theme (Animals & Habitats).', 'Medium', '2026-06-14', 'In Progress'),
('H-002', 'Mid-day Meal Service Prep', 'Arrange high chairs and assist in feeding the Toddler group with milk & fruit puree.', 'High', '2026-06-12', 'Pending');

-- Notifications
INSERT INTO notifications (user_id, message, type) VALUES
(3, 'Welcome! You have been assigned to Playgroup - Nestling for the morning shift today.', 'Duty Change'),
(5, 'Your leave request for June 12, 2026, has been approved by the Centre Head.', 'Attendance'),
(1, 'Staff shortage warning: Helper H-001 is on leave. High priority tasks reassigned.', 'Shift Alert');
