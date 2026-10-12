const DAY = 86400000;

export const daysLeft = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / DAY);
};

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const inr = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Normalise any subscription to its monthly cost
export const monthlyCost = (s) => (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
