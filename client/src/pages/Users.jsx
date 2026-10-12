import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { fmtDate } from '../utils';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(errMsg(err));
    }
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    try {
      await api.put(`/users/${u._id}/role`, { role });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their subscriptions?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <h1>User Management</h1>
      <p className="muted">Admin only: manage accounts and roles.</p>
      {error && <p className="error banner" onClick={() => setError('')}>{error} (click to dismiss)</p>}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Subscriptions</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u._id === me.id;
              return (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong> {self && <span className="muted">(you)</span>}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                  <td>{u.subscriptionCount}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td className="actions">
                    {!self && (
                      <>
                        <button
                          className="btn small ghost"
                          onClick={() => changeRole(u, u.role === 'admin' ? 'user' : 'admin')}
                        >
                          Make {u.role === 'admin' ? 'user' : 'admin'}
                        </button>
                        <button className="btn small danger" onClick={() => remove(u)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
