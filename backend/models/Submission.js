const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Submission', {
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
    },
    totalWords: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    correctWords: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wrongWords: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'submissions',
    timestamps: true
  });
};
