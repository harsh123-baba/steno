const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../db');
const { User } = sequelize.models;
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, phone, password, confirmPassword, isAdmin } = req.body;
  if (!email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Email, phone, and passwords are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, phone, password: hashed, isAdmin });
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
      subscriptionType: user.subscriptionType,
      subscriptionTenure: user.subscriptionTenure,
      subscriptionStart: user.subscriptionStart,
      subscriptionExpiry: user.subscriptionExpiry
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Downgrade expired premium
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      user.subscriptionType = 'simple';
      user.subscriptionTenure = 0;
      user.subscriptionStart = null;
      user.subscriptionExpiry = null;
      user.isPremium = false;
      await user.save();
    }
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
      subscriptionType: user.subscriptionType,
      subscriptionTenure: user.subscriptionTenure,
      subscriptionStart: user.subscriptionStart,
      subscriptionExpiry: user.subscriptionExpiry
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
