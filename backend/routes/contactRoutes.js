const express = require('express');
const router = express.Router();
const connection = require('../config/db1');

// Submit contact form (public)
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    const query = `
      INSERT INTO contact_submissions (name, email, phone, subject, message, status) 
      VALUES (?, ?, ?, ?, ?, 'new')
    `;
    
    const [result] = await connection.query(query, [name, email, phone || null, subject || 'General Inquiry', message]);
    
    res.json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: result.insertId 
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

// Get all contact submissions (admin)
router.get('/api/admin/contacts', async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    let query = `
      SELECT id, name, email, phone, subject, message, status, created_at 
      FROM contact_submissions 
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [results] = await connection.query(query, params);
    res.json({ success: true, contacts: results });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Get contact statistics (admin)
router.get('/api/admin/contacts/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count
      FROM contact_submissions
    `;
    
    const [results] = await connection.query(query);
    res.json({ success: true, stats: results[0] });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Update contact status (admin)
router.put('/api/admin/contacts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: new, read, or replied' 
      });
    }

    const query = 'UPDATE contact_submissions SET status = ? WHERE id = ?';
    await connection.query(query, [status, id]);
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Delete contact submission (admin)
router.delete('/api/admin/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM contact_submissions WHERE id = ?';
    await connection.query(query, [id]);
    
    res.json({ success: true, message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

module.exports = router;
