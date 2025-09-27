const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Test', {
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
    dictationWpm: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    },
    wordCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    audioDuration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    testType: {
      type: DataTypes.ENUM('free', 'premium', 'go-live'),
      defaultValue: 'go-live'
    }
  }, {
    tableName: 'tests',
    timestamps: true
  });
};
