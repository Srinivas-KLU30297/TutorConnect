const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get messages between users
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    const [messages] = await db.execute(`
      SELECT 
        m.*,
        sender.name as sender_name,
        receiver.name as receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId]);
    
    // Mark messages as read
    await db.execute(`
      UPDATE messages 
      SET read_status = TRUE 
      WHERE receiver_id = ? AND sender_id = ?
    `, [currentUserId, otherUserId]);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content, booking_id } = req.body;
    
    const [result] = await db.execute(`
      INSERT INTO messages (sender_id, receiver_id, content, booking_id)
      VALUES (?, ?, ?, ?)
    `, [senderId, receiver_id, content, booking_id]);
    
    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: result.insertId 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
