import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';

const money = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const day = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const iso = d => (d ? new Date(d).toISOString().slice(0, 10) : '');
const daysLeft = d => Math.ceil((new Date(d) - Date.now()) / 864e5);
const CYCLE = { monthly: 'mo', quarterly: 'qtr', yearly: 'yr' };
const EMPTY = { service: '', plan: '', amount: '', billingCycle: 'monthly', startDate: iso(new Date()), renewalDate: '', status: 'active' };

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault(); setErr('');
    try {
      const r = await api(`/auth/${mode}`, { method: 'POST', body: f });
      localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user)); onAuth(r.user);
    } catch (e) { setErr(e.message); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <main className="auth">
      <form onSubmit={submit}>
        <h1>SubTrack</h1>
        <p className="muted">Know what renews, when, and what it costs.</p>
        {mode === 'register' && <label>Name<input required value={f.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" minLength={6} required value={f.password} onChange={set('password')} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="primary">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </form>
    </main>
  );
}

function SubForm({ initial, onSave, onClose }) {
  const [f, setF] = useState({ ...initial, startDate: iso(initial.startDate), renewalDate: iso(initial.renewalDate) });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { await onSave({ ...f, amount: Number(f.amount) }); } catch (e) { setErr(e.message); }
  };
  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h2>{initial._id ? 'Edit subscription' : 'Add subscription'}</h2>
        <div className="grid">
          <label>Service<input required value={f.service} onChange={set('service')} placeholder="Netflix" /></label>
          <label>Plan<input required value={f.plan} onChange={set('plan')} placeholder="Premium" /></label>
          <label>Amount (₹)<input type="number" min="0" step="0.01" required value={f.amount} onChange={set('amount')} /></label>
          <label>Billing cycle
            <select value={f.billingCycle} onChange={set('billingCycle')}>
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
            </select></label>
          <label>Start date<input type="date" required value={f.startDate} onChange={set('startDate')} /></label>
          <label>Renewal date<input type="date" required value={f.renewalDate} onChange={set('renewalDate')} /></label>
          <label>Status
            <select value={f.status} onChange={set('status')}>
              <option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option>
            </select></label>
        </div>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="row end"><button type="button" onClick={onClose}>Cancel</button><button className="primary">Save changes</button></div>
      </form>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const load = () => api('/users').then(setUsers);
  useEffect(() => { load(); }, []);
  const remove = async u => { if (confirm(`Delete ${u.name} and all their subscriptions?`)) { await api(`/users/${u._id}`, { method: 'DELETE' }); load(); } };
  return (
    <div className="tablewrap"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
      <tbody>{users.map(u => (
        <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{day(u.createdAt)}</td>
          <td className="actions">{u.role !== 'admin' && <button onClick={() => remove(u)}>Delete</button>}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

function Dashboard({ user, onLogout }) {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('subs');
  const [err, setErr] = useState('');
  const isAdmin = user.role === 'admin';

  const load = useCallback(async () => {
    try {
      const [s, st] = await Promise.all([api(`/subscriptions?q=${encodeURIComponent(q)}&status=${status}`), api('/subscriptions/stats')]);
      setSubs(s); setStats(st); setErr('');
    } catch (e) { setErr(e.message); if (e.message.includes('sign in')) onLogout(); }
  }, [q, status]);
  useEffect(() => { load(); }, [load]);

  const save = async data => {
    await api(data._id ? `/subscriptions/${data._id}` : '/subscriptions', { method: data._id ? 'PUT' : 'POST', body: data });
    setEditing(null); load();
  };
  const renew = async s => { await api(`/subscriptions/${s._id}/renew`, { method: 'PATCH' }); load(); };
  const remove = async s => { if (confirm(`Delete ${s.service}?`)) { await api(`/subscriptions/${s._id}`, { method: 'DELETE' }); load(); } };

  return (
    <div className="shell">
      <header>
        <h1>SubTrack</h1>
        <nav>
          <button className={tab === 'subs' ? 'on' : ''} onClick={() => setTab('subs')}>Subscriptions</button>
          {isAdmin && <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Users</button>}
        </nav>
        <span className="muted">{user.name} ({user.role}) <button className="link" onClick={onLogout}>Sign out</button></span>
      </header>
      {tab === 'users' ? <Users /> : <>
        {stats && (
          <section className="stats">
            <div className="lead"><b>{money(stats.monthlySpend)}</b><span>per month across {stats.active} active subscriptions</span></div>
            <div><b>{money(stats.yearlySpend)}</b><span>per year</span></div>
            <div className={stats.dueIn7Days ? 'warn' : ''}><b>{stats.dueIn7Days}</b><span>renewing within 7 days</span></div>
          </section>
        )}
        <div className="row">
          <input placeholder="Search by service" value={q} onChange={e => setQ(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option>
          </select>
          <button className="primary push" onClick={() => setEditing(EMPTY)}>Add subscription</button>
        </div>
        {err && <p className="error">{err}</p>}
        <div className="tablewrap"><table>
          <thead><tr><th>Service</th><th>Plan</th><th>Amount</th><th>Started</th><th>Renews</th><th>Status</th>{isAdmin && <th>Owner</th>}<th></th></tr></thead>
          <tbody>
            {subs.map(s => {
              const d = daysLeft(s.renewalDate);
              const due = s.status === 'active' && d <= 7;
              return (
                <tr key={s._id}>
                  <td><b>{s.service}</b></td><td>{s.plan}</td>
                  <td>{money(s.amount)} <small>/{CYCLE[s.billingCycle]}</small></td>
                  <td>{day(s.startDate)}</td>
                  <td className={due ? 'due' : ''}>{day(s.renewalDate)}{s.status === 'active' && <small> {d < 0 ? `${-d}d overdue` : d === 0 ? 'today' : `in ${d}d`}</small>}</td>
                  <td><span className={`pill ${s.status}`}>{s.status}</span></td>
                  {isAdmin && <td>{s.user?.name}</td>}
                  <td className="actions">
                    <button onClick={() => renew(s)}>Renew</button>
                    <button onClick={() => setEditing(s)}>Edit</button>
                    <button onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {!subs.length && <tr><td colSpan="8" className="empty">No subscriptions yet. Add one to start tracking renewals.</td></tr>}
          </tbody>
        </table></div>
      </>}
      {editing && <SubForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const logout = () => { localStorage.clear(); setUser(null); };
  return user ? <Dashboard user={user} onLogout={logout} /> : <Auth onAuth={setUser} />;
}
