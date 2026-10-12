import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await (isLogin ? login(form) : register(form));
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h1 className="brand big">SubTrack</h1>
        <p className="muted">Track every subscription and renewal in one place.</p>
        <h2>{isLogin ? 'Login' : 'Create account'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          {!isLogin && (
            <input name="name" placeholder="Full name" value={form.name} onChange={change} required />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={change}
            minLength={6}
            required
          />
          <button className="btn" disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="muted">
          {isLogin ? (
            <>No account? <Link to="/register">Register</Link></>
          ) : (
            <>Already registered? <Link to="/login">Login</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
