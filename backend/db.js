const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log('MySQL connection established successfully.'))
  .catch(err => console.error('Unable to connect to MySQL:', err));


module.exports = sequelize;
require('./models/User');
require('./models/Test');
require('./models/Submission');
