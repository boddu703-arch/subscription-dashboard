import { inr, monthlyCost, daysLeft } from '../utils';

export default function StatsCards({ subs }) {
  const active = subs.filter((s) => s.status === 'active');
  const monthly = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const upcoming = active.filter((s) => {
    const d = daysLeft(s.renewalDate);
    return d >= 0 && d <= 7;
  });
  const overdue = active.filter((s) => daysLeft(s.renewalDate) < 0);

  return (
    <div className="cards">
      <div className="card"><h4>Total subscriptions</h4><p>{subs.length}</p></div>
      <div className="card"><h4>Active</h4><p>{active.length}</p></div>
      <div className="card"><h4>Monthly spend</h4><p>{inr(monthly)}</p></div>
      <div className="card"><h4>Yearly spend</h4><p>{inr(monthly * 12)}</p></div>
      <div className="card warn"><h4>Renewing in 7 days</h4><p>{upcoming.length}</p></div>
      <div className="card danger"><h4>Overdue renewal</h4><p>{overdue.length}</p></div>
    </div>
  );
}
