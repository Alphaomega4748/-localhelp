import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Wrench, User, Mail, Phone, Lock, ChevronRight } from 'lucide-react';

const categories = ['electrician','plumber','carpenter','painter','cleaner','mechanic','helper','ac_repair','pest_control'];

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'customer');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', category:'electrician', hourlyRate:200, bio:'', experience:0 });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({ ...form, role });
      toast.success(`Welcome to LocalHelp, ${data.user.name}! 🎉`);
      if (role === 'worker') navigate('/worker/dashboard');
      else navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22 }}>LocalHelp</span>
        </div>

        <div className="card" style={{ padding: 40 }}>
          <h2 style={{ fontSize: 28, marginBottom: 6 }}>Create Account</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
            Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>

          {/* Role toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28, background: 'var(--gray-100)', padding: 4, borderRadius: 12 }}>
            {['customer', 'worker'].map(r => (
              <button key={r} type="button" onClick={() => { setRole(r); setStep(1); }}
                style={{ padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Outfit, sans-serif',
                  background: role === r ? 'white' : 'transparent', color: role === r ? 'var(--primary)' : 'var(--gray-500)',
                  boxShadow: role === r ? 'var(--shadow)' : 'none', transition: 'all 0.2s' }}>
                {r === 'customer' ? '👤 I need help' : '🔧 I offer services'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step === 1 && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
                  <input className="input" style={{ paddingLeft: 42 }} placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
                  <input className="input" style={{ paddingLeft: 42 }} type="email" placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
                  <input className="input" style={{ paddingLeft: 42 }} placeholder="Phone number" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
                  <input className="input" style={{ paddingLeft: 42 }} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                </div>
                {role === 'worker' ? (
                  <button type="button" className="btn btn-primary btn-full" onClick={() => setStep(2)}>
                    Next: Worker Details <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                )}
              </>
            )}

            {step === 2 && role === 'worker' && (
              <>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Service Category</label>
                  <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Hourly Rate (₹)</label>
                  <input className="input" type="number" min="50" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Experience (years)</label>
                  <input className="input" type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Short Bio</label>
                  <textarea className="input" rows={3} placeholder="Tell customers about your skills..." value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button type="button" className="btn btn-outline btn-full" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Join as Worker'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
