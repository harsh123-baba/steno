const express = require('express');
const multer = require('multer');
const Test = require('../models/Test');
const { auth, admin } = require('../middleware/auth');

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
      const { name, category, timeLimit, expectedText } = req.body;
      console.log(`[Admin] Payload: timeLimit=${timeLimit}, expectedTextLength=${expectedText?.length}`);
      const audioFile = req.file;
      console.log(`[Admin] Received audio file: ${audioFile?.originalname}`);

      if (!name || !category || !timeLimit || !audioFile || !expectedText) {
        return res
          .status(400)
          .json({ message: 'All fields are required.' });
      }


      const test = await Test.create({
        name,
        category,
        timeLimit: Number(timeLimit),
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

module.exports = router;
