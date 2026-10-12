import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="brand">SubTrack</span>
        <NavLink to="/" end>Dashboard</NavLink>
        {isAdmin && <NavLink to="/users">Users</NavLink>}
      </div>
      <div className="nav-right">
        <span className="who">
          {user.name} <span className={`badge ${user.role}`}>{user.role}</span>
        </span>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
