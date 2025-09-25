const express = require('express');
const multer = require('multer');
const { Test, User } = require('../db').models;
const { auth, admin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const router = express.Router();

// Helper function to get audio duration
async function getAudioDuration(audioPath) {
  try {
    const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=nw=1 "${audioPath}"`);
    const duration = parseFloat(stdout);
    return isNaN(duration) ? null : Math.round(duration);
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return null;
  }
}

// Helper function to get word count
function getWordCount(text) {
  return text.trim().split(/\s+/).filter(w => w).length;
}

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
      if (!name || !category || !timeLimit || !dictationWpm || !audioFile || !expectedText) {
        return res
          .status(400)
          .json({ message: 'All fields are required.' });
      }

      console.log(`Word count: ${wordCount}`)
    const audioDuration = await getAudioDuration(req.file.path);

    const test = await Test.create({
      name,
      category,
      timeLimit,
      dictationWpm,
      expectedText,
      wordCount: getWordCount(expectedText),
      audioPath: `/uploads/${req.file.filename}`,
      contentType: req.file.mimetype,
      audioDuration
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


router.put(
  '/tests/:id',
  auth,
  admin,
  upload.single('audio'),
  async (req, res) => {
    console.log(`[Admin] Edit test request: user=${req.user.id}, testId=${req.params.id}`);
    try {
      const test = await Test.findByPk(req.params.id);
      if (!test) {
        return res.status(404).json({ message: 'Test not found.' });
      }

      const { name, category, timeLimit, expectedText, dictationWpm } = req.body;
      console.log(`[Admin] Edit payload: timeLimit=${timeLimit}, expectedTextLength=${expectedText?.length}, dictationWpm=${dictationWpm}`);
      
      // Update test properties
      test.name = name || test.name;
      test.category = category || test.category;
      test.timeLimit = timeLimit ? Number(timeLimit) : test.timeLimit;
      test.dictationWpm = dictationWpm || test.dictationWpm;
      test.expectedText = expectedText || test.expectedText;
      
      // Update word count if text changed
      if (expectedText) {
        const wordCount = expectedText.trim().split(/\s+/).filter(w => w).length;
        test.wordCount = wordCount;
        console.log(`Word count updated: ${wordCount}`);
      }
      
      // Update audio file if a new one was uploaded
      if (req.file) {
        console.log(`[Admin] New audio file uploaded: ${req.file.originalname}`);
        // Delete old audio file
        if (fs.existsSync(test.audioPath)) {
          fs.unlinkSync(test.audioPath);
        }
        test.audioPath = req.file.path;
        test.contentType = req.file.mimetype;
      }

      await test.save();
      res.json(test);
    } catch (err) {
      console.error(`[Admin] Edit test error: ${err.message}`, err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

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
