const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { protect, adminOnly } = require('../middleware/auth');

// Everything here is admin-only
router.use(protect, adminOnly);

// GET /api/users  (with each user's subscription count)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const counts = await Subscription.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    res.json(users.map((u) => ({ ...u, subscriptionCount: map[String(u._id)] || 0 })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/users/:id/role  { role: 'admin' | 'user' }
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/users/:id  (also removes that user's subscriptions)
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Subscription.deleteMany({ user: req.params.id });
    res.json({ message: 'User and their subscriptions deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
