const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get student bookings
router.get('/bookings', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const [bookings] = await db.execute(`
      SELECT 
        b.*,
        u.name as tutor_name,
        s.name as subject_name
      FROM bookings b
      JOIN users u ON b.tutor_id = u.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.student_id = ?
      ORDER BY b.session_date DESC, b.session_time DESC
    `, [studentId]);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create booking request
router.post('/bookings', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutor_id, subject_id, session_date, session_time, duration, notes } = req.body;
    
    // Get tutor's hourly rate
    const [tutors] = await db.execute(
      'SELECT hourly_rate FROM tutors WHERE user_id = ?',
      [tutor_id]
    );
    
    if (tutors.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    
    const price = (tutors[0].hourly_rate * duration) / 60;
    
    const [result] = await db.execute(`
      INSERT INTO bookings 
      (student_id, tutor_id, subject_id, session_date, session_time, duration, price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, tutor_id, subject_id, session_date, session_time, duration, price, notes]);
    
    res.status(201).json({ 
      message: 'Booking request created successfully',
      bookingId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

module.exports = router;
