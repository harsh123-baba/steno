const express = require('express');
const multer = require('multer');
const { Test, User } = require('../db').models;
const { auth, admin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.AUDIO_STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Admin can upload a new test (name, audio file, and transcription txt)
router.post(
  '/tests',
  auth,
  admin,
  upload.single('audio'),
  async (req, res) => {
    console.log(`[Admin] Upload test request: user=${req.user.id}, name=${req.body.name}, category=${req.body.category}`);
    try {
      const { name, category, timeLimit, expectedText, dictationWpm } = req.body;
      console.log(`[Admin] Payload: timeLimit=${timeLimit}, expectedTextLength=${expectedText?.length}, dictationWpm=${dictationWpm}`);
      const audioFile = req.file;
      console.log(`[Admin] Received audio file: ${audioFile?.originalname}`);
      const wordCount = expectedText.trim().split(/\s+/).filter(w => w).length;
      console.log("lsdkjfa", dictationWpm)
      if (!name || !category || !timeLimit || !dictationWpm || !audioFile || !expectedText) {
        return res
          .status(400)
          .json({ message: 'All fields are required.' });
      }

      console.log(`Word count: ${wordCount}`)
      const test = await Test.create({
        name,
        category,
        timeLimit: Number(timeLimit),
        dictationWpm: dictationWpm,
        wordCount,
        audioPath: req.file.path,
        contentType: audioFile.mimetype,
        expectedText
      });

      res.json(test);
    } catch (err) {
      console.error(`[Admin] Upload test error: ${err.message}`, err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/promote', auth, admin, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    console.log(user)
    user.isAdmin = true;
    await user.save();
    res.json({ message: `${username} has been promoted to admin.` });
  } catch (err) {
    console.error('[Admin] Promote user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/tests/:id', auth, admin,
  async (req, res) => {
    try {
      const test = await Test.findByPk(req.params.id);
      console.log(`[Admin] Delete test request: user=${req.user.id}, testId=${test}`);

      if (!test) {
        return res.status(404).json({ message: 'Test not found.' });
      }

      const filename = path.basename(test.audioPath, path.extname(test.audioPath)); // strip extension
      const mp3Path = path.join(process.env.AUDIO_STORAGE_PATH, filename + '.mp3');
      const oggPath = path.join(process.env.AUDIO_STORAGE_PATH, filename + '.ogg');

      await test.destroy();

      if (fs.existsSync(mp3Path)) {
        fs.unlinkSync(mp3Path);
      }

      if (fs.existsSync(oggPath)) {
        fs.unlinkSync(oggPath);
      }
      res.json({ message: 'Test deleted successfully.' });
    } catch (err) {
      console.error('[Admin] Delete test error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
router.get('/users', auth, admin, async (req, res) => {
  try {
    let users = await User.findAll({ attributes: ['id', 'username', 'email', 'phone', 'isAdmin', 'isPremium', 'subscriptionType', 'subscriptionTenure', 'subscriptionStart', 'subscriptionExpiry', 'createdAt'] });
    const now = new Date();
    for (const u of users) {
      if (u.subscriptionExpiry && new Date(u.subscriptionExpiry) < now) {
        u.subscriptionType = 'simple';
        u.subscriptionTenure = 0;
        u.subscriptionStart = null;
        u.subscriptionExpiry = null;
        u.isPremium = false;
        await u.save();
      }
    }
    res.json(users);
  } catch (err) {
    console.error('[Admin] Fetch users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/userRole', auth, admin, async (req, res) => {
  const { id, subscriptionType, subscriptionTenure } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.subscriptionType = subscriptionType;
    user.subscriptionTenure = subscriptionTenure;
    if (subscriptionType === 'premium' && subscriptionTenure > 0) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + Number(subscriptionTenure));
      user.subscriptionExpiry = expiry;
      user.subscriptionStart = new Date();
      user.isPremium = true;
    } else {
      user.subscriptionExpiry = null;
      user.subscriptionStart = null;
      user.isPremium = false;
    }
    await user.save();
    res.json({ message: `User ${user.username} premium status updated.` });
  } catch (err) {
    console.error('[Admin] Update user role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
