import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Home, Calendar, User, LogOut, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const links = user?.role === 'worker'
    ? [{ to: '/worker/dashboard', icon: Home, label: 'Dashboard' }, { to: '/bookings', icon: Calendar, label: 'Bookings' }, { to: '/profile', icon: User, label: 'Profile' }]
    : [{ to: '/home', icon: Home, label: 'Home' }, { to: '/bookings', icon: Calendar, label: 'Bookings' }, { to: '/profile', icon: User, label: 'Profile' }];

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to={user?.role === 'worker' ? '/worker/dashboard' : '/home'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>LocalHelp</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9,
              background: pathname === to ? 'var(--primary-light)' : 'transparent',
              color: pathname === to ? 'var(--primary)' : 'var(--gray-500)',
              fontWeight: pathname === to ? 600 : 400, fontSize: 14, transition: 'all 0.15s' }}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color="var(--gray-500)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 10, background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: 'white', fontSize: 12 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
