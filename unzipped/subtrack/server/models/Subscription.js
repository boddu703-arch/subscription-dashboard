const { Schema, model } = require('mongoose');
module.exports = model('Subscription', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true, trim: true },
  plan: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, required: true },
  renewalDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
}, { timestamps: true }));
