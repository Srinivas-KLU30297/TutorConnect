const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all tutors (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { subject, location, minRate, maxRate } = req.query;
    
    let query = `
      SELECT 
        u.id, u.name, u.location, u.created_at,
        t.bio, t.hourly_rate, t.experience, t.rating, t.total_reviews,
        GROUP_CONCAT(DISTINCT s.name) as subjects
      FROM users u
      JOIN tutors t ON u.id = t.user_id
      LEFT JOIN tutor_subjects ts ON t.id = ts.tutor_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE u.role = 'tutor'
    `;
    
    const params = [];
    
    if (subject) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${subject}%`);
    }
    
    if (location) {
      query += ` AND u.location LIKE ?`;
      params.push(`%${location}%`);
    }
    
    if (minRate) {
      query += ` AND t.hourly_rate >= ?`;
      params.push(minRate);
    }
    
    if (maxRate) {
      query += ` AND t.hourly_rate <= ?`;
      params.push(maxRate);
    }
    
    query += ` GROUP BY u.id ORDER BY t.rating DESC, t.total_reviews DESC`;
    
    const [tutors] = await db.execute(query, params);
    
    // Format subjects as array
    const formattedTutors = tutors.map(tutor => ({
      ...tutor,
      subjects: tutor.subjects ? tutor.subjects.split(',') : []
    }));
    
    res.json(formattedTutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Get specific tutor profile
router.get('/:id', async (req, res) => {
  try {
    const tutorId = req.params.id;
    
    const [tutors] = await db.execute(`
      SELECT 
        u.id, u.name, u.email, u.location, u.phone, u.created_at,
        t.bio, t.hourly_rate, t.experience, t.rating, t.total_reviews, t.verified
      FROM users u
      JOIN tutors t ON u.id = t.user_id
      WHERE u.id = ? AND u.role = 'tutor'
    `, [tutorId]);
    
    if (tutors.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    
    // Get subjects
    const [subjects] = await db.execute(`
      SELECT s.name 
      FROM subjects s
      JOIN tutor_subjects ts ON s.id = ts.subject_id
      JOIN tutors t ON ts.tutor_id = t.id
      WHERE t.user_id = ?
    `, [tutorId]);
    
    // Get availability
    const [availability] = await db.execute(`
      SELECT day_of_week, start_time, end_time
      FROM availability
      WHERE tutor_id = (SELECT id FROM tutors WHERE user_id = ?)
      ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    `, [tutorId]);
    
    // Get recent reviews
    const [reviews] = await db.execute(`
      SELECT r.rating, r.comment, r.created_at, u.name as student_name
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      WHERE r.tutor_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [tutorId]);
    
    const tutor = {
      ...tutors[0],
      subjects: subjects.map(s => s.name),
      availability,
      reviews
    };
    
    res.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({ error: 'Failed to fetch tutor profile' });
  }
});

// Update tutor profile (tutor only)
router.put('/profile', authenticateToken, requireRole(['tutor']), async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { bio, hourly_rate, experience, subjects } = req.body;
    
    // Update tutor profile
    await db.execute(`
      UPDATE tutors 
      SET bio = ?, hourly_rate = ?, experience = ?, updated_at = NOW()
      WHERE user_id = ?
    `, [bio, hourly_rate, experience, tutorId]);
    
    // Update subjects if provided
    if (subjects && Array.isArray(subjects)) {
      // Get tutor's database ID
      const [tutorData] = await db.execute(
        'SELECT id FROM tutors WHERE user_id = ?',
        [tutorId]
      );
      
      if (tutorData.length > 0) {
        const tutorDbId = tutorData[0].id;
        
        // Delete existing subjects
        await db.execute('DELETE FROM tutor_subjects WHERE tutor_id = ?', [tutorDbId]);
        
        // Insert new subjects
        for (const subjectName of subjects) {
          // Get or create subject
          let [subject] = await db.execute('SELECT id FROM subjects WHERE name = ?', [subjectName]);
          
          if (subject.length === 0) {
            const [result] = await db.execute('INSERT INTO subjects (name) VALUES (?)', [subjectName]);
            subject = [{ id: result.insertId }];
          }
          
          // Link tutor to subject
          await db.execute(
            'INSERT INTO tutor_subjects (tutor_id, subject_id) VALUES (?, ?)',
            [tutorDbId, subject[0].id]
          );
        }
      }
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
