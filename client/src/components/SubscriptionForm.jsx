import { useState, useEffect } from 'react';
import { toInputDate } from '../utils';

const empty = {
  service: '',
  plan: '',
  amount: '',
  billingCycle: 'monthly',
  startDate: '',
  renewalDate: '',
  status: 'active',
};

export default function SubscriptionForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setForm(
      editing
        ? {
            service: editing.service,
            plan: editing.plan,
            amount: editing.amount,
            billingCycle: editing.billingCycle || 'monthly',
            startDate: toInputDate(editing.startDate),
            renewalDate: toInputDate(editing.renewalDate),
            status: editing.status,
          }
        : empty
    );
  }, [editing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.renewalDate < form.startDate) {
      setError('Renewal date cannot be before the start date');
      return;
    }
    setError('');
    const ok = await onSave({ ...form, amount: Number(form.amount) });
    if (ok) setForm(empty);
  };

  return (
    <form className="panel sub-form" onSubmit={submit}>
      <h3>{editing ? `Edit: ${editing.service}` : 'Add subscription'}</h3>
      {error && <p className="error full">{error}</p>}
      <label>Service
        <input name="service" placeholder="e.g. Netflix" value={form.service} onChange={change} required />
      </label>
      <label>Plan
        <input name="plan" placeholder="e.g. Premium" value={form.plan} onChange={change} required />
      </label>
      <label>Amount (₹)
        <input name="amount" type="number" min="0" step="any" placeholder="649" value={form.amount} onChange={change} required />
      </label>
      <label>Billing cycle
        <select name="billingCycle" value={form.billingCycle} onChange={change}>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      <label>Start date
        <input name="startDate" type="date" value={form.startDate} onChange={change} required />
      </label>
      <label>Renewal date
        <input name="renewalDate" type="date" value={form.renewalDate} onChange={change} required />
      </label>
      <label>Status
        <select name="status" value={form.status} onChange={change}>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <div className="form-actions">
        <button className="btn">{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
