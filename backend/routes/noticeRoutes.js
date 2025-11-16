const express = require('express');
const router = express.Router();
const connection = require('../config/db1');

// Get all active notices (for landing page)
router.get('/api/notices', async (req, res) => {
  try {
    const query = `
      SELECT id, title, content, priority, created_at, updated_at 
      FROM notices 
      WHERE is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `;
    
    const [results] = await connection.query(query);
    res.json({ success: true, notices: results });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
});

// Get all notices (for admin - includes inactive)
router.get('/api/admin/notices', async (req, res) => {
  try {
    const query = `
      SELECT id, title, content, priority, is_active, created_at, updated_at 
      FROM notices 
      ORDER BY created_at DESC
    `;
    
    const [results] = await connection.query(query);
    res.json({ success: true, notices: results });
  } catch (error) {
    console.error('Error fetching admin notices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
});

// Create new notice
router.post('/api/admin/notices', async (req, res) => {
  try {
    const { title, content, priority = 'normal', is_active = 1 } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    const query = `
      INSERT INTO notices (title, content, priority, is_active) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await connection.query(query, [title, content, priority, is_active]);
    
    res.json({ 
      success: true, 
      message: 'Notice created successfully',
      noticeId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ success: false, message: 'Failed to create notice' });
  }
});

// Update notice
router.put('/api/admin/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, is_active } = req.body;

    const query = `
      UPDATE notices 
      SET title = ?, content = ?, priority = ?, is_active = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    
    await connection.query(query, [title, content, priority, is_active, id]);
    
    res.json({ success: true, message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ success: false, message: 'Failed to update notice' });
  }
});

// Delete notice
router.delete('/api/admin/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM notices WHERE id = ?';
    await connection.query(query, [id]);
    
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notice' });
  }
});

module.exports = router;
