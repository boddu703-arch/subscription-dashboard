const router = require('express').Router();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');

router.use(protect);

// Admin can access every record, a normal user only their own
const scope = (req) => (req.user.role === 'admin' ? {} : { user: req.user._id });

const FIELDS = ['service', 'plan', 'amount', 'billingCycle', 'startDate', 'renewalDate', 'status'];
const pick = (body) =>
  FIELDS.reduce((acc, f) => (body[f] !== undefined ? { ...acc, [f]: body[f] } : acc), {});

const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  next();
};

// READ all (supports ?status=active&search=net)
router.get('/', async (req, res) => {
  try {
    const filter = { ...scope(req) };
    if (['active', 'cancelled'].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ service: rx }, { plan: rx }];
    }
    const subs = await Subscription.find(filter)
      .populate('user', 'name email')
      .sort({ renewalDate: 1 });
    res.json(subs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// READ one
router.get('/:id', validId, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, ...scope(req) }).populate(
      'user',
      'name email'
    );
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const sub = await Subscription.create({ ...pick(req.body), user: req.user._id });
    res.status(201).json(sub);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE
router.put('/:id', validId, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, ...scope(req) });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    sub.set(pick(req.body));
    await sub.save(); // runs validators, including the date check
    res.json(sub);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE
router.delete('/:id', validId, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
