const router = require('express').Router();
const User = require('../models/User'), Sub = require('../models/Subscription');
const { protect, adminOnly } = require('../middleware/auth');
router.use(protect, adminOnly);
router.get('/', async (req, res) => res.json(await User.find().select('-password').sort('-createdAt')));
router.delete('/:id', async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: "You can't delete yourself" });
  await Sub.deleteMany({ user: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
