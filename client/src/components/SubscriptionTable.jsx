import { useAuth } from '../AuthContext';
import { daysLeft, fmtDate, inr } from '../utils';

function renewalLabel(s) {
  if (s.status !== 'active') return null;
  const d = daysLeft(s.renewalDate);
  if (d < 0) return <span className="tag red">overdue {Math.abs(d)}d</span>;
  if (d === 0) return <span className="tag amber">today</span>;
  if (d <= 7) return <span className="tag amber">in {d}d</span>;
  return null;
}

export default function SubscriptionTable({ subs, onEdit, onToggle, onDelete }) {
  const { isAdmin } = useAuth();
  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            {isAdmin && <th>Owner</th>}
            <th>Service</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Start</th>
            <th>Renewal</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s._id} className={s.status === 'cancelled' ? 'dim' : ''}>
              {isAdmin && <td>{s.user?.name || '—'}</td>}
              <td><strong>{s.service}</strong></td>
              <td>{s.plan}</td>
              <td>{inr(s.amount)} <span className="muted">/{s.billingCycle === 'yearly' ? 'yr' : 'mo'}</span></td>
              <td>{fmtDate(s.startDate)}</td>
              <td>{fmtDate(s.renewalDate)} {renewalLabel(s)}</td>
              <td><span className={`tag ${s.status === 'active' ? 'green' : 'grey'}`}>{s.status}</span></td>
              <td className="actions">
                <button className="btn small" onClick={() => onEdit(s)}>Edit</button>
                <button className="btn small ghost" onClick={() => onToggle(s)}>
                  {s.status === 'active' ? 'Cancel' : 'Reactivate'}
                </button>
                <button className="btn small danger" onClick={() => onDelete(s)}>Delete</button>
              </td>
            </tr>
          ))}
          {subs.length === 0 && (
            <tr><td colSpan={isAdmin ? 8 : 7} className="muted center">No subscriptions found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
