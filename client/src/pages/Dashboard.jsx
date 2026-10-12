import { useEffect, useMemo, useState } from 'react';
import api, { errMsg } from '../api';
import StatsCards from '../components/StatsCards';
import SpendChart from '../components/SpendChart';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionTable from '../components/SubscriptionTable';

export default function Dashboard() {
  const [subs, setSubs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('renewal');

  const load = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubs(data);
      setError('');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // Returns true on success so the form can reset itself
  const save = async (form) => {
    try {
      if (editing) await api.put(`/subscriptions/${editing._id}`, form);
      else await api.post('/subscriptions', form);
      setEditing(null);
      await load();
      return true;
    } catch (err) {
      setError(errMsg(err));
      return false;
    }
  };

  const toggle = async (s) => {
    try {
      await api.put(`/subscriptions/${s._id}`, {
        status: s.status === 'active' ? 'cancelled' : 'active',
      });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete "${s.service}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/subscriptions/${s._id}`);
      if (editing?._id === s._id) setEditing(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = subs.filter(
      (s) =>
        (status === 'all' || s.status === status) &&
        (!q || s.service.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q))
    );
    const sorters = {
      renewal: (a, b) => new Date(a.renewalDate) - new Date(b.renewalDate),
      amount: (a, b) => b.amount - a.amount,
      name: (a, b) => a.service.localeCompare(b.service),
    };
    return [...list].sort(sorters[sort]);
  }, [subs, search, status, sort]);

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Subscription Dashboard</h1>
      {error && <p className="error banner" onClick={() => setError('')}>{error} (click to dismiss)</p>}

      <StatsCards subs={subs} />

      <div className="grid-2">
        <SubscriptionForm editing={editing} onSave={save} onCancel={() => setEditing(null)} />
        <SpendChart subs={subs} />
      </div>

      <div className="toolbar">
        <input
          placeholder="Search service or plan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="renewal">Sort: next renewal</option>
          <option value="amount">Sort: highest amount</option>
          <option value="name">Sort: name A–Z</option>
        </select>
      </div>

      <SubscriptionTable
        subs={visible}
        onEdit={(s) => { setEditing(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onToggle={toggle}
        onDelete={remove}
      />
    </>
  );
}
