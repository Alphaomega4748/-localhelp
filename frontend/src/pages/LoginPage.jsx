import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Wrench, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'worker') navigate('/worker/dashboard');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left panel */}
      <div style={{ background: 'var(--secondary)', padding: '60px 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'white' }}>LocalHelp</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 40, lineHeight: 1.2, marginBottom: 16 }}>Welcome<br />back 👋</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Book trusted local workers in minutes. Fast, reliable, affordable.</p>

          <div style={{ marginTop: 48, display: 'flex', gap: 16 }}>
            {['4.9★ Rating', 'Verified Workers', '24/7 Support'].map(t => (
              <div key={t} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 5%', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Sign In</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="input" style={{ paddingLeft: 44 }} type="email" placeholder="Email address"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="input" style={{ paddingLeft: 44, paddingRight: 44 }} type={showPass ? 'text' : 'password'}
                placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Demo credentials */}
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 14, fontSize: 13 }}>
              <strong>Demo accounts:</strong><br />
              Customer: customer@demo.com / 123456<br />
              Worker: worker@demo.com / 123456<br />
              Admin: admin@demo.com / 123456
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
