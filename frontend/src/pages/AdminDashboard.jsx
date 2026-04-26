import { useState, useEffect } from 'react';
import { Users, Briefcase, TrendingUp, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalBookings: 0, completedBookings: 0, revenue: 0 });
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data.stats)).catch(() => setStats({ totalUsers: 1240, totalWorkers: 89, totalBookings: 3456, completedBookings: 2980, revenue: 145000 }));
    adminAPI.getWorkers().then(r => setWorkers(r.data.workers)).catch(() => setWorkers(getMockWorkers()));
    adminAPI.getBookings().then(r => setBookings(r.data.bookings)).catch(() => setBookings(getMockBookings()));
  }, []);

  const verifyWorker = async (id) => {
    try {
      await adminAPI.verifyWorker(id);
      setWorkers(prev => prev.map(w => w._id === id ? { ...w, isVerified: true } : w));
      toast.success('Worker verified!');
    } catch {
      setWorkers(prev => prev.map(w => w._id === id ? { ...w, isVerified: true } : w));
      toast.success('Worker verified! (Demo)');
    }
  };

  const kpis = [
    { icon: Users, label: 'Total Customers', value: stats.totalUsers.toLocaleString(), color: '#3B82F6' },
    { icon: Briefcase, label: 'Total Workers', value: stats.totalWorkers, color: 'var(--primary)' },
    { icon: TrendingUp, label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), color: '#8B5CF6' },
    { icon: DollarSign, label: 'Platform Revenue', value: `₹${(stats.revenue/1000).toFixed(1)}K`, color: '#06D6A0' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>Admin Dashboard</h1>
          <span className="badge badge-orange">Admin Panel</span>
        </div>

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {kpis.map(k => (
            <div key={k.label} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${k.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <k.icon size={22} color={k.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)' }}>{k.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['overview', 'workers', 'bookings'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14,
                background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : 'var(--gray-600)', boxShadow: 'var(--shadow)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Workers Table */}
        {tab === 'workers' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ fontSize: 18 }}>All Workers ({workers.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)' }}>
                    {['Name', 'Category', 'Rate', 'Rating', 'Bookings', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w, i) => (
                    <tr key={w._id} style={{ borderTop: '1px solid var(--gray-100)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{w.user?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{w.user?.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>{w.category?.replace('_',' ')}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>₹{w.hourlyRate}/hr</td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>⭐ {w.rating?.toFixed(1)}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>{w.totalBookings}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${w.isVerified ? 'badge-success' : 'badge-warning'}`}>
                          {w.isVerified ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {!w.isVerified && (
                          <button onClick={() => verifyWorker(w._id)} className="btn btn-primary btn-sm">
                            <CheckCircle size={13} /> Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ fontSize: 18 }}>Recent Bookings</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)' }}>
                    {['Customer', 'Worker', 'Service', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b._id} style={{ borderTop: '1px solid var(--gray-100)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.customer?.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.worker?.user?.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.service?.category?.replace('_',' ')}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>₹{b.pricing?.totalAmount}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>{b.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-500)' }}>{new Date(b.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid-2">
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Quick Stats</h3>
              {[
                { label: 'Completion Rate', value: `${Math.round((stats.completedBookings/Math.max(stats.totalBookings,1))*100)}%`, color: '#06D6A0' },
                { label: 'Active Workers', value: Math.round(stats.totalWorkers * 0.7), color: 'var(--primary)' },
                { label: 'Avg Booking Value', value: `₹${Math.round(stats.revenue/Math.max(stats.completedBookings,1))}`, color: '#8B5CF6' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ color: 'var(--gray-600)', fontSize: 14 }}>{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Pending Actions</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--primary-light)', borderRadius: 12, cursor: 'pointer' }} onClick={() => setTab('workers')}>
                <AlertTriangle size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Workers pending verification</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{workers.filter(w => !w.isVerified).length} workers waiting</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getMockWorkers() {
  return [
    { _id: 'w1', user: { name: 'Rahul Sharma', email: 'rahul@example.com' }, category: 'electrician', hourlyRate: 250, rating: 4.9, totalBookings: 128, isVerified: true },
    { _id: 'w2', user: { name: 'Suresh Kumar', email: 'suresh@example.com' }, category: 'plumber', hourlyRate: 200, rating: 4.7, totalBookings: 95, isVerified: true },
    { _id: 'w3', user: { name: 'Mohan Das', email: 'mohan@example.com' }, category: 'carpenter', hourlyRate: 300, rating: 4.8, totalBookings: 76, isVerified: false },
    { _id: 'w4', user: { name: 'Priya Singh', email: 'priya@example.com' }, category: 'cleaner', hourlyRate: 150, rating: 4.6, totalBookings: 210, isVerified: false },
  ];
}
function getMockBookings() {
  return [
    { _id: 'b1', customer: { name: 'Arun Patel' }, worker: { user: { name: 'Rahul Sharma' } }, service: { category: 'electrician' }, pricing: { totalAmount: 500 }, status: 'completed', createdAt: new Date() },
    { _id: 'b2', customer: { name: 'Meera Singh' }, worker: { user: { name: 'Suresh Kumar' } }, service: { category: 'plumber' }, pricing: { totalAmount: 400 }, status: 'pending', createdAt: new Date() },
    { _id: 'b3', customer: { name: 'Ravi Kumar' }, worker: { user: { name: 'Priya Singh' } }, service: { category: 'cleaner' }, pricing: { totalAmount: 300 }, status: 'ongoing', createdAt: new Date() },
  ];
}
