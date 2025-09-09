const express = require('express');
const fs = require('fs');
const path = require('path');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');
const router = express.Router();

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
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// GET all tests (list metadata)
router.get('/', auth, async (req, res) => {
  try {
    const tests = await Test.findAll({
      attributes: ['id', 'name', 'category', 'timeLimit']
    });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET results overview for all tests
router.get('/results/all', auth, async (req, res) => {
  try {
    const submissionsData = await Submission.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
      include: [{ model: Test, attributes: ['id', 'name', 'category', 'timeLimit'] }]
    });
    const grouped = submissionsData.reduce((acc, cur) => {
      const id = cur.Test.id;
      if (!acc[id]) acc[id] = { test: cur.Test, submissions: [] };
      acc[id].submissions.push(cur);
      return acc;
    }, {});
    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single test (audio only)
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    const filePath = test.audioPath;
    const audioBuffer = fs.readFileSync(filePath);
    const audio = audioBuffer.toString('base64');
    const contentType = test.contentType;
    res.json({
      id: test.id,
      name: test.name,
      category: test.category,
      timeLimit: test.timeLimit,
      audio,
      contentType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit typing result
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { typedText, timeTaken } = req.body;
    if (typedText == null || timeTaken == null) {
      return res.status(400).json({ message: 'typedText and timeTaken are required.' });
    }
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const expected = test.expectedText || '';
    const errors = expected ? levenshteinDistance(typedText.trim(), expected.trim()) : 0;
    const wordsTyped = typedText.trim().split(/\s+/).filter(w => w).length;
    const wpm = Math.round((wordsTyped / (timeTaken / 60)) || 0);
    const accuracy = expected.length ? Math.max(0, Math.round(((expected.length - errors) / expected.length) * 100)) : 100;

    await Submission.create({
      userId: req.user.id,
      testId: req.params.id,
      typedText,
      timeTaken,
      errors,
      accuracy,
      wpm
    });

    res.json({ errors, accuracy, wpm });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET results for a single test
router.get('/:id/results', auth, async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    const submissions = await Submission.findAll({
      where: { userId: req.user.id, testId: req.params.id },
      order: [['createdAt', 'ASC']],
      attributes: ['createdAt', 'errors', 'accuracy', 'wpm', 'typedText']
    });
    res.json({ expectedText: test.expectedText, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
