const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Test = require('./Test');

const Submission = sequelize.define('Submission', {
  typedText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timeTaken: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  errors: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  wpm: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'submissions',
  timestamps: true
});

// Define associations
Submission.belongsTo(User, { foreignKey: 'userId' });
Submission.belongsTo(Test, { foreignKey: 'testId' });

module.exports = Submission;
