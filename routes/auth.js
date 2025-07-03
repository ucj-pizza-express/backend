const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  global.otpMemory = { [email]: otp };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PizzaExpress" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for PizzaExpress Signup',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, otp, password } = req.body;

  if (global.otpMemory?.[email] != otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  try {
    //const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;