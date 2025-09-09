const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


router.post('/register', async (req, res) => {
  console.log("hello", req.body)
const { username, email, phone, password, confirmPassword, isAdmin } = req.body;
console.log(`[Auth] Register request: username=${username}, isAdmin=${isAdmin}`);
if (!email || !phone || !confirmPassword) return res.status(400).json({ message: 'Email, phone, and password confirmation are required' });
if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
  try {
let existingUser = await User.findOne({ where: { username } });
if (existingUser) return res.status(400).json({ message: 'User already exists' });
let emailExists = await User.findOne({ where: { email } });
if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, phone, password: hashed, isAdmin });
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
} catch (err) {
    console.error(`[Auth] Register error: ${err.message}`, err);
    res.status(500).json({ message: 'Server error' });
}
});

// Login
router.post('/login', async (req, res) => {
  console.log("bro")
const { username, password } = req.body;
console.log(`[Auth] Login request: username=${username}`);
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
} catch (err) {
    console.error(`[Auth] Login error: ${err.message}`, err);
    res.status(500).json({ message: 'Server error' });
}
});

module.exports = router;
