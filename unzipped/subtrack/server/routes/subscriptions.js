const router = require('express').Router();
const Sub = require('../models/Subscription'), { protect } = require('../middleware/auth');
router.use(protect);
const scope = req => (req.user.role === 'admin' ? {} : { user: req.user._id });
const MONTHS = { monthly: 1, quarterly: 3, yearly: 12 };
const FIELDS = ['service', 'plan', 'amount', 'billingCycle', 'startDate', 'renewalDate', 'status'];
const pick = b => Object.fromEntries(FIELDS.filter(k => b[k] !== undefined).map(k => [k, b[k]]));

router.get('/', async (req, res, next) => {
  try {
    const f = scope(req);
    if (req.query.status) f.status = req.query.status;
    if (req.query.q) f.service = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    res.json(await Sub.find(f).populate('user', 'name email').sort('renewalDate'));
  } catch (e) { next(e); }
});
router.get('/stats', async (req, res, next) => {
  try {
    const subs = await Sub.find({ ...scope(req), status: 'active' });
    const monthly = s => s.amount / MONTHS[s.billingCycle];
    const soon = Date.now() + 7 * 864e5;
    const m = subs.reduce((t, s) => t + monthly(s), 0);
    res.json({
      active: subs.length,
      monthlySpend: +m.toFixed(2),
      yearlySpend: +(m * 12).toFixed(2),
      dueIn7Days: subs.filter(s => s.renewalDate <= soon).length,
    });
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Sub.create({ ...pick(req.body), user: req.user._id })); }
  catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const s = await Sub.findOneAndUpdate({ _id: req.params.id, ...scope(req) }, pick(req.body), { new: true, runValidators: true });
    s ? res.json(s) : res.status(404).json({ message: 'Subscription not found' });
  } catch (e) { next(e); }
});
router.patch('/:id/renew', async (req, res, next) => {
  try {
    const s = await Sub.findOne({ _id: req.params.id, ...scope(req) });
    if (!s) return res.status(404).json({ message: 'Subscription not found' });
    const d = new Date(s.renewalDate); d.setMonth(d.getMonth() + MONTHS[s.billingCycle]);
    s.renewalDate = d; s.status = 'active'; res.json(await s.save());
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const s = await Sub.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    s ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Subscription not found' });
  } catch (e) { next(e); }
});
module.exports = router;
