const router = require('express').Router();
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), User = require('../models/User');
const sign = u => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role },
});
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
    const role = email && email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    const u = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
    res.status(201).json(sign(u));
  } catch (e) { next(e); }
});
router.post('/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password)))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json(sign(u));
});
module.exports = router;
