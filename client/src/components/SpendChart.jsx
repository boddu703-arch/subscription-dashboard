import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inr, monthlyCost } from '../utils';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2', '#db2777', '#65a30d'];

export default function SpendChart({ subs }) {
  const totals = {};
  subs
    .filter((s) => s.status === 'active')
    .forEach((s) => {
      totals[s.service] = (totals[s.service] || 0) + monthlyCost(s);
    });
  const data = Object.entries(totals).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  return (
    <div className="panel">
      <h3>Monthly spend by service</h3>
      {data.length === 0 ? (
        <p className="muted">No active subscriptions to chart yet.</p>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={(d) => d.name}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => inr(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
