const sequelize = require('./db');

async function addTestTypeColumn() {
  try {
    // Add the testType column to the tests table
    await sequelize.query(`
      ALTER TABLE tests 
      ADD COLUMN testType ENUM('free', 'premium', 'hidden') DEFAULT 'hidden'
    `);
    
    console.log('Successfully added testType column to tests table');
  } catch (error) {
    console.error('Error adding testType column:', error);
  }
}

addTestTypeColumn();
