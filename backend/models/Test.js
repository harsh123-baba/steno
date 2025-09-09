const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Test = sequelize.define('Test', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('ssc', 'court', 'others'),
    allowNull: false
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  audioPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contentType: {
    type: DataTypes.STRING
  },
  expectedText: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'tests',
  timestamps: true
});

module.exports = Test;
