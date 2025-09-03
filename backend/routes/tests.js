const express = require('express');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET all tests (list audio files)
router.get('/', auth, async (req, res) => {
  try {
const tests = await Test.find().select('_id name category timeLimit');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET results overview for all tests
router.get('/results/all', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .populate('test', 'name category timeLimit')
      .select('test errors accuracy wpm createdAt');
    const grouped = submissions.reduce((acc, cur) => {
      const id = cur.test._id;
      if (!acc[id]) acc[id] = { test: cur.test, submissions: [] };
      acc[id].submissions.push(cur);
      return acc;
    }, {});
    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single test (audio only)
router.get('/:id', auth, async (req, res) => {
  try {
const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    const audio = test.audio.data.toString('base64');
    const contentType = test.audio.contentType;
    res.json({ _id: test._id, name: test.name, category: test.category, timeLimit: test.timeLimit, audio, contentType });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit typing result
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { typedText, timeTaken } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (typedText == null || timeTaken == null) {
      return res.status(400).json({ message: 'typedText and timeTaken are required.' });
    }
    
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const expected = test.expectedText || '';
    const errors = expected ? levenshteinDistance(typedText.trim(), expected.trim()) : 0;

    const wordsTyped = typedText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const wpm = Math.round((wordsTyped / (timeTaken / 60)) || 0);

    const accuracy = expected.length
      ? Math.max(0, Math.round(((expected.length - errors) / expected.length) * 100))
      : 100;

    const submission = new Submission({
      user: req.user.id,
      test: test._id,
      typedText,
      timeTaken,
      errors,
      accuracy,
      wpm
    });
    await submission.save();

    res.json({ errors, accuracy, wpm });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Levenshtein distance algorithm
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

router.post('/:id/attempt', auth, async (req, res) => {
  try {
    const { typedText, timeTaken } = req.body;
    if (typedText == null || timeTaken == null) {
      return res.status(400).json({ message: 'typedText and timeTaken are required.' });
    }
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const expected = test.expectedText;
    const errors = levenshteinDistance(typedText.trim(), expected.trim());

    const wordsTyped = typedText.trim().split(/\s+/).length;
    const wpm = Math.round((wordsTyped / (timeTaken / 60)) || 0);

    const accuracy = expected.length
      ? Math.max(0, Math.round(((expected.length - errors) / expected.length) * 100))
      : 0;

    res.json({ errors, accuracy, wpm });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/results', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    const submissions = await Submission.find({ user: req.user.id, test: req.params.id })
      .sort({ createdAt: 1 })
      .select('createdAt errors accuracy wpm typedText');
    res.json({ expectedText: test.expectedText, submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
