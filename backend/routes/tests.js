const express = require('express');
const fs = require('fs');
const path = require('path');
const { Test, Submission } = require('../db').models;
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
  const tests = await Test.findAll();
    res.json(tests);
    console.log(`[${new Date().toISOString()}] GET /tests 200`);
  } catch (err) {
    console.log(`[${new Date().toISOString()}] GET /tests 500`);
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
      contentType,
      createdAt: test.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to calculate word-based differences
function calculateWordDifferences(expectedText, typedText) {
  const expectedWords = expectedText.trim().split(/\s+/).filter(w => w);
  const typedWords = typedText.trim().split(/\s+/).filter(w => w);
  
  const totalWords = expectedWords.length;
  let correctWords = 0;
  let wrongWords = 0;
  
  // Compare words at each position
  const minLength = Math.min(expectedWords.length, typedWords.length);
  for (let i = 0; i < minLength; i++) {
    if (expectedWords[i] === typedWords[i]) {
      correctWords++;
    } else {
      wrongWords++;
    }
  }
  
  // Handle extra words in typed text
  if (typedWords.length > expectedWords.length) {
    wrongWords += typedWords.length - expectedWords.length;
  }
  
  // Handle missing words
  if (expectedWords.length > typedWords.length) {
    wrongWords += expectedWords.length - typedWords.length;
  }
  
  return { totalWords, correctWords, wrongWords };
}

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
    
    // Calculate word-based metrics
    const { totalWords, correctWords, wrongWords } = calculateWordDifferences(expected, typedText);
    const wordsTyped = typedText.trim().split(/\s+/).filter(w => w).length;
    const wpm = Math.round((wordsTyped / (timeTaken / 60)) || 0);
    const marks = totalWords ? Math.max(0, Math.round((correctWords / totalWords) * 100)) : 100;
    
    // Keep character-based errors for backward compatibility
    const errors = expected ? levenshteinDistance(typedText.trim(), expected.trim()) : 0;

    await Submission.create({
      userId: req.user.id,
      testId: req.params.id,
      typedText,
      timeTaken,
      errors,
      accuracy: marks, // Store marks instead of accuracy
      wpm,
      totalWords,
      correctWords,
      wrongWords
    });

    res.json({ errors, accuracy: marks, wpm, totalWords, correctWords, wrongWords });
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
      attributes: ['createdAt', 'errors', 'accuracy', 'wpm', 'typedText', 'totalWords', 'correctWords', 'wrongWords']
    });
    res.json({ expectedText: test.expectedText, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
