require('dotenv').config();
const cron = require('node-cron');
const { Op } = require('sequelize');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { User } = sequelize.models;
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
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    cron.schedule('0 0 * * *', async () => {
      const now = new Date();
      try {
        const expiredUsers = await User.findAll({
          where: {
            isPremium: true,
            subscriptionExpiry: { [Op.lt]: now }
          }
        });
        for (const u of expiredUsers) {
          u.isPremium = false;
          u.subscriptionType = 'simple';
          u.subscriptionTenure = 0;
          u.subscriptionExpiry = null;
          await u.save();
        }
        console.log(`[Cron] Downgraded ${expiredUsers.length} expired premium users`);
      } catch (err) {
        console.error('[Cron] Error in scheduled downgrade:', err);
      }
    });
  })
  .catch((err) => console.error(err));
