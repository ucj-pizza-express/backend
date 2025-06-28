const express = require('express');
const router = express.Router();
const Contact = require('../Models/Contact');

router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message', error: err.message });
  }
});

module.exports = router;
