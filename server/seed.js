// Optional: npm run seed
// Creates an admin and a demo user with sample subscriptions.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Subscription.deleteMany({});
  await User.deleteMany({ email: { $in: ['admin@example.com', 'demo@example.com'] } });

  const pass = await bcrypt.hash('password123', 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: pass, role: 'admin' });
  const demo = await User.create({ name: 'Demo User', email: 'demo@example.com', password: pass });

  await Subscription.insertMany([
    { user: demo._id, service: 'Netflix', plan: 'Premium', amount: 649, billingCycle: 'monthly', startDate: daysFromNow(-60), renewalDate: daysFromNow(3) },
    { user: demo._id, service: 'Spotify', plan: 'Individual', amount: 119, billingCycle: 'monthly', startDate: daysFromNow(-200), renewalDate: daysFromNow(12) },
    { user: demo._id, service: 'YouTube Premium', plan: 'Family', amount: 189, billingCycle: 'monthly', startDate: daysFromNow(-90), renewalDate: daysFromNow(6) },
    { user: demo._id, service: 'Adobe Creative Cloud', plan: 'All Apps', amount: 4999, billingCycle: 'yearly', startDate: daysFromNow(-300), renewalDate: daysFromNow(65) },
    { user: demo._id, service: 'Hotstar', plan: 'Super', amount: 299, billingCycle: 'yearly', startDate: daysFromNow(-400), renewalDate: daysFromNow(-5), status: 'cancelled' },
    { user: admin._id, service: 'GitHub', plan: 'Pro', amount: 330, billingCycle: 'monthly', startDate: daysFromNow(-120), renewalDate: daysFromNow(20) },
  ]);

  console.log('Seeded. Logins (password: password123): admin@example.com, demo@example.com');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
