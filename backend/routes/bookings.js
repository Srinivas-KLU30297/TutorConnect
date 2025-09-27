const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    const [bookings] = await db.execute(`
      SELECT 
        b.*,
        student.name as student_name,
        student.email as student_email,
        tutor.name as tutor_name,
        tutor.email as tutor_email,
        s.name as subject_name
      FROM bookings b
      JOIN users student ON b.student_id = student.id
      JOIN users tutor ON b.tutor_id = tutor.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.id = ? AND (b.student_id = ? OR b.tutor_id = ?)
    `, [bookingId, userId, userId]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(bookings[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status (tutor only)
router.put('/:id/status', authenticateToken, requireRole(['tutor']), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const tutorId = req.user.id;
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await db.execute(`
      UPDATE bookings 
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND tutor_id = ?
    `, [status, bookingId, tutorId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }
    
    res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

module.exports = router;
