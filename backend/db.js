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

// Export sequelize instance before loading models to resolve circular dependency
module.exports = sequelize;

// Load model definitions
require('./models/User')(sequelize);
require('./models/Test')(sequelize);
require('./models/Submission')(sequelize);

// Define associations after models loaded
const { User, Test, Submission } = sequelize.models;

User.hasMany(Submission, { foreignKey: 'userId' });
Test.hasMany(Submission, { foreignKey: 'testId' });
Submission.belongsTo(User, { foreignKey: 'userId' });
Submission.belongsTo(Test, { foreignKey: 'testId' });
