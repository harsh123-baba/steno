const express = require('express');
const fs = require('fs');
const path = require('path');
const { Test, Submission } = require('../db').models;
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
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

// GET all tests (list metadata) with pagination support
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Also support search if provided
    const search = req.query.search || '';
    
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const { count, rows: tests } = await Test.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalTests: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    });
    console.log(`[${new Date().toISOString()}] GET /tests 200`);
  } catch (err) {
    console.log(`[${new Date().toISOString()}] GET /tests 500`);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET results overview for all tests with pagination support
router.get('/results/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const submissionsData = await Submission.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: Test, attributes: ['id', 'name', 'category', 'timeLimit'] }]
    });
    
    const grouped = submissionsData.reduce((acc, cur) => {
      const id = cur.Test.id;
      if (!acc[id]) acc[id] = { test: cur.Test, submissions: [] };
      acc[id].submissions.push(cur);
      return acc;
    }, {});
    
    const allResults = Object.values(grouped);
    const totalResults = allResults.length;
    const paginatedResults = allResults.slice(offset, offset + limit);
    
    res.json({
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults: totalResults,
        hasNext: page < Math.ceil(totalResults / limit),
        hasPrev: page > 1
      }
    });
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


function cleanPTagString(str) {
  if (str.length > 7) {  // 3 + 4 = 7 chars total
    return str.substring(3, str.length - 4);
  } else {
    return '';
  }
}


function calculateWordDifferences(expectedText, typedText) {
  let expectedWords = expectedText.trim().split(/\s+/).filter(w => w);
  let typedWords = typedText.trim().split(/\s+/).filter(w => w);
  const totalWords = expectedWords.length;
  let correctWords = 0;
  console.log("sjdkfnhjaksfh", expectedWords, typedWords)

  const typedWordsMap = {};
  typedWords.forEach(word => {
    typedWordsMap[word] = (typedWordsMap[word] || 0) + 1;
  });
  
  expectedWords.forEach(word => {
    if (typedWordsMap[word] > 0) {
      correctWords++;
      typedWordsMap[word]--;
    }
  });
  
  const wrongWords = totalWords - correctWords;
  return { totalWords, correctWords, wrongWords };
}

// Submit typing result
router.post('/:id/submit', auth, async (req, res) => {
  try {
    let { typedText, timeTaken } = req.body;
    if (typedText == null || timeTaken == null) {
      return res.status(400).json({ message: 'typedText and timeTaken are required.' });
    }
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    let expected = test.expectedText || '';
    console.log(expected)
    console.log(typedText)
    
    // Calculate word-based metrics
    expected = cleanPTagString(expected);
    typedText = cleanPTagString(typedText);

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
      order: [['createdAt', 'DESC']],
      attributes: ['createdAt', 'errors', 'accuracy', 'wpm', 'typedText', 'totalWords', 'correctWords', 'wrongWords']
    });
    res.json({ expectedText: test.expectedText, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
