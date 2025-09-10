require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const testRoutes = require('./routes/tests');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);

const PORT = process.env.PORT || 5000;
console.log('Connecting to MySQL...');
sequelize
  .authenticate()
  .then(() => sequelize.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;"))
  .then(() => sequelize.sync())
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error(err));
