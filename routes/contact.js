const express = require('express');
const router = express.Router();
const Contact = require('../Models/Contact');
const nodemailer = require('nodemailer');
const User = require('../Models/User'); // ✅ Fixes the ReferenceError


// Save contact message
router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message', error: err.message });
  }
});

// Send email notification to all contacts
// POST /api/contact/send
router.post('/send', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // You can fetch all users or specific ones
    const users = await User.find({ role: 'user' });

    // Save message to DB
    await Notification.create({ message, sentTo: users.length });

    // Example: simulate sending (log to console or send email/notification logic)
    console.log("📢 Sending message to users:", users.map(u => u.email));
    console.log("📝 Message:", message);

    res.json({
      success: true,
      sentTo: users.length
    });
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// ✅ GET /api/feedback - Get all feedback messages
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Contact.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
  }
});

// ✅ DELETE /api/contact/:id - Delete a feedback message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error("❌ Failed to delete feedback:", err);
    res.status(500).json({ message: 'Failed to delete feedback', error: err.message });
  }
});


module.exports = router;
