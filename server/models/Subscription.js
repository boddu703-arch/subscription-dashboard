const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    service: { type: String, required: true, trim: true }, // e.g. Netflix
    plan: { type: String, required: true, trim: true }, // e.g. Premium
    amount: { type: Number, required: true, min: 0 }, // price per billing cycle
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    startDate: { type: Date, required: true },
    renewalDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

subscriptionSchema.pre('validate', function (next) {
  if (this.startDate && this.renewalDate && this.renewalDate < this.startDate) {
    this.invalidate('renewalDate', 'Renewal date cannot be before the start date');
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
