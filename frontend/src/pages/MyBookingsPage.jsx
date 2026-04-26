// MyBookingsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { bookingAPI } from '../utils/api';
import { Calendar, MessageCircle, Star, ChevronRight } from 'lucide-react';

const statusColor = { pending:'badge-warning', accepted:'badge-info', ongoing:'badge-orange', completed:'badge-success', cancelled:'badge-danger', rejected:'badge-danger' };
const categoryIcons = { electrician:'⚡', plumber:'🔧', carpenter:'🪚', painter:'🎨', cleaner:'🧹', mechanic:'🔩', helper:'👷', ac_repair:'❄️', pest_control:'🐛' };

export function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(() => setBookings(getMockBookings()))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>My Bookings</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all','pending','accepted','ongoing','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
                background: filter === s ? 'var(--primary)' : 'white', color: filter === s ? 'white' : 'var(--gray-600)',
                boxShadow: filter === s ? '0 4px 12px rgba(255,107,53,0.3)' : 'var(--shadow)' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner" /></div> :
          filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--gray-400)' }}>
              <Calendar size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <h3>No bookings found</h3>
              <Link to="/home" className="btn btn-primary" style={{ marginTop: 16 }}>Find Workers</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(b => (
                <div key={b._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                      {categoryIcons[b.service?.category] || '🛠️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <h3 style={{ fontSize: 16 }}>{b.worker?.user?.name || 'Worker'}</h3>
                          <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>{b.service?.category?.replace('_', ' ')} • {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`badge ${statusColor[b.status]}`}>{b.status}</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>{b.service?.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{b.pricing?.totalAmount || 0}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['accepted','ongoing'].includes(b.status) && (
                            <Link to={`/chat/${b._id}`} className="btn btn-outline btn-sm">
                              <MessageCircle size={14} /> Chat
                            </Link>
                          )}
                          <Link to={`/bookings/${b._id}`} className="btn btn-primary btn-sm">
                            Details <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function getMockBookings() {
  return [
    { _id: 'b1', worker: { user: { name: 'Rahul Sharma' } }, service: { category: 'electrician', description: 'Fix bedroom switchboard' }, status: 'completed', scheduledAt: new Date(), pricing: { totalAmount: 500 } },
    { _id: 'b2', worker: { user: { name: 'Suresh Kumar' } }, service: { category: 'plumber', description: 'Bathroom tap leakage repair' }, status: 'pending', scheduledAt: new Date(Date.now() + 86400000), pricing: { totalAmount: 300 } },
    { _id: 'b3', worker: { user: { name: 'Ravi Yadav' } }, service: { category: 'ac_repair', description: 'AC gas refill and servicing' }, status: 'accepted', scheduledAt: new Date(Date.now() + 3600000), pricing: { totalAmount: 700 } },
  ];
}

export default MyBookingsPage;
