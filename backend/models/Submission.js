const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  typedText: { type: String, required: true },
  timeTaken: { type: Number, required: true }, // seconds
  errors: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  wpm: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
