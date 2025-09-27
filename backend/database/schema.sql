-- Create database
CREATE DATABASE IF NOT EXISTS tutorconnect;
USE tutorconnect;

-- Users table (both students and tutors)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'tutor') NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Tutors table (additional info for tutors)
CREATE TABLE tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    bio TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 50.00,
    experience VARCHAR(100),
    education TEXT,
    languages JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    total_students INT DEFAULT 0,
    total_hours INT DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0.00,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rating (rating),
    INDEX idx_hourly_rate (hourly_rate)
);

-- Subjects table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
);

-- Tutor-Subject relationship (many-to-many)
CREATE TABLE tutor_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tutor_subject (tutor_id, subject_id),
    INDEX idx_tutor_id (tutor_id),
    INDEX idx_subject_id (subject_id)
);

-- Availability table
CREATE TABLE availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    INDEX idx_tutor_day (tutor_id, day_of_week)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    subject_id INT,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration INT DEFAULT 60,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    session_type ENUM('online', 'in_person') DEFAULT 'online',
    meeting_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_student_id (student_id),
    INDEX idx_tutor_id (tutor_id),
    INDEX idx_session_date (session_date),
    INDEX idx_status (status)
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    booking_id INT,
    content TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_read_status (read_status)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    booking_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_tutor_id (tutor_id),
    INDEX idx_rating (rating)
);

-- Insert default subjects
INSERT INTO subjects (name, category) VALUES 
('Mathematics', 'STEM'),
('Physics', 'STEM'),
('Chemistry', 'STEM'),
('Biology', 'STEM'),
('Computer Science', 'STEM'),
('Programming', 'STEM'),
('Web Development', 'STEM'),
('English', 'Language Arts'),
('Literature', 'Language Arts'),
('Writing', 'Language Arts'),
('History', 'Social Studies'),
('Geography', 'Social Studies'),
('Economics', 'Social Studies'),
('Spanish', 'Languages'),
('French', 'Languages'),
('German', 'Languages'),
('SAT Prep', 'Test Prep'),
('ACT Prep', 'Test Prep'),
('GMAT Prep', 'Test Prep'),
('GRE Prep', 'Test Prep');

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (email, password, name, role, location, phone, verified) VALUES 
('sarah@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewi5O8x6u5QgKnFW', 'Sarah Johnson', 'student', 'New York, NY', '+1-555-0101', TRUE),
('john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewi5O8x6u5QgKnFW', 'John Davis', 'student', 'Los Angeles, CA', '+1-555-0102', TRUE),
('mike@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewi5O8x6u5QgKnFW', 'Dr. Michael Smith', 'tutor', 'New York, NY', '+1-555-0103', TRUE),
('emily@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewi5O8x6u5QgKnFW', 'Emily Chen', 'tutor', 'New York, NY', '+1-555-0104', TRUE),
('alex@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewi5O8x6u5QgKnFW', 'Alex Rodriguez', 'tutor', 'San Francisco, CA', '+1-555-0105', TRUE);

-- Insert tutor profiles
INSERT INTO tutors (user_id, bio, hourly_rate, experience, education, rating, total_reviews, total_students, verified) VALUES 
(3, 'Experienced physics and mathematics tutor with over 10 years of teaching experience. I specialize in helping students understand complex concepts through practical examples.', 65.00, '10+ years', 'Ph.D. in Physics, M.S. in Mathematics', 4.8, 127, 156, TRUE),
(4, 'English literature specialist helping students improve writing skills and develop a love for reading. Expert in essay writing and literary analysis.', 45.00, '5+ years', 'M.A. in English Literature, Certified Writing Instructor', 4.9, 89, 94, TRUE),
(5, 'Full-stack developer teaching programming languages and helping with coding projects and technical interviews. Specialized in web development.', 75.00, '3+ years tutoring', 'B.S. Computer Science, Full Stack Developer, Google Certified', 4.7, 156, 123, TRUE);

-- Link tutors to subjects
INSERT INTO tutor_subjects (tutor_id, subject_id, proficiency_level) VALUES 
(1, 1, 'expert'),  -- Mike - Mathematics
(1, 2, 'expert'),  -- Mike - Physics
(2, 8, 'expert'),  -- Emily - English
(2, 9, 'expert'),  -- Emily - Literature
(2, 10, 'advanced'), -- Emily - Writing
(3, 5, 'expert'),  -- Alex - Computer Science
(3, 6, 'expert'),  -- Alex - Programming
(3, 7, 'expert');  -- Alex - Web Development

-- Insert sample availability
INSERT INTO availability (tutor_id, day_of_week, start_time, end_time) VALUES 
(1, 'monday', '09:00:00', '12:00:00'),
(1, 'monday', '15:00:00', '18:00:00'),
(1, 'tuesday', '10:00:00', '14:00:00'),
(1, 'wednesday', '09:00:00', '13:00:00'),
(1, 'thursday', '11:00:00', '15:00:00'),
(1, 'friday', '09:00:00', '12:00:00'),
(2, 'monday', '14:00:00', '17:00:00'),
(2, 'tuesday', '09:00:00', '13:00:00'),
(2, 'wednesday', '15:00:00', '18:00:00'),
(2, 'thursday', '10:00:00', '14:00:00'),
(2, 'friday', '09:00:00', '15:00:00'),
(3, 'monday', '18:00:00', '22:00:00'),
(3, 'tuesday', '15:00:00', '18:00:00'),
(3, 'wednesday', '14:00:00', '17:00:00'),
(3, 'thursday', '17:00:00', '20:00:00'),
(3, 'friday', '15:00:00', '18:00:00');

-- Create indexes for performance
CREATE INDEX idx_users_role_verified ON users(role, verified);
CREATE INDEX idx_tutors_rating_verified ON tutors(rating DESC, verified);
CREATE INDEX idx_bookings_date_status ON bookings(session_date, status);
CREATE INDEX idx_messages_unread ON messages(receiver_id, read_status, created_at);
