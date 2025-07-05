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
  const role = email === 'admin@gmail.com' ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
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

    res.status(200).json({ message: 'Login successful',role: user.role  });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//send mail to forgetpass
// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000);
//   global.otpMemory = { [email]: otp };

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `"PizzaExpress" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Your OTP for Password Reset',
//     text: `Your OTP is: ${otp}`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// });


const crypto = require('crypto');

router.post('/forget-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token & expiration (1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expireTime = Date.now() + 3600000;

    user.resetToken = token;
    user.resetTokenExpire = expireTime;
    await user.save();

    // Create reset link - adjust frontend URL as needed
    const resetLink = `http://localhost:5173/updatepassword/${token}`;

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
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send password reset link' });
  }
});

//update pass
//(notworking)

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET all users
router.get('/', async (req, res) => {
  try { res.json(await User.find().select('-password')); }
  catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST add user
router.post('/', async (req, res) => {
  try { res.status(201).json(await User.create(req.body)); }
  catch (e) { res.status(400).json({ error: 'Bad request' }); }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.sendStatus(204); }
  catch (e) { res.status(404).json({ error: 'User not found' }); }
});

// PATCH update role / activity
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (e) { res.status(404).json({ error: 'User not found' }); }
});



module.exports = router;