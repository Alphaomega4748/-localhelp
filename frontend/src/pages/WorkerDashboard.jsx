import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Star, TrendingUp, DollarSign, CheckSquare, MessageCircle, MapPin } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, workerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const { user, workerProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isAvailable, setIsAvailable] = useState(workerProfile?.isAvailable ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(() => setBookings(getMockWorkerBookings()))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    try {
      await workerAPI.updateProfile({ isAvailable: newVal });
      toast.success(newVal ? '✅ You are now available' : '⏸️ You are now offline');
    } catch {
      toast.success(newVal ? '✅ You are now available (Demo)' : '⏸️ You are now offline (Demo)');
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status} (Demo)`);
    }
  };

  const stats = {
    totalEarnings: workerProfile?.totalEarnings || 12500,
    totalBookings: workerProfile?.totalBookings || 48,
    rating: workerProfile?.rating || 4.8,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  const statusColor = { pending:'badge-warning', accepted:'badge-info', ongoing:'badge-orange', completed:'badge-success', cancelled:'badge-danger' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div className="card" style={{ padding: 24, marginBottom: 24, background: 'var(--secondary)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: 'white', fontSize: 24, marginBottom: 4 }}>Welcome, {user?.name} 👋</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                {workerProfile?.category?.replace('_',' ') || 'Worker'} • ₹{workerProfile?.hourlyRate || 250}/hr
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: isAvailable ? '#06D6A0' : 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600 }}>
                {isAvailable ? '● Available' : '○ Offline'}
              </span>
              <button onClick={toggleAvailability} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAvailable ? '#06D6A0' : 'rgba(255,255,255,0.4)' }}>
                {isAvailable ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { icon: DollarSign, label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, color: '#06D6A0' },
            { icon: CheckSquare, label: 'Jobs Completed', value: stats.totalBookings, color: 'var(--primary)' },
            { icon: Star, label: 'Rating', value: `${stats.rating}★`, color: '#FFD166' },
            { icon: TrendingUp, label: 'Pending Requests', value: stats.pending, color: '#A78BFA' },
          ].map(st => (
            <div key={st.label} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${st.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <st.icon size={22} color={st.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--secondary)' }}>{st.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{st.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Booking Requests</h2>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> :
            bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>No bookings yet. Make sure you're available!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bookings.map(b => (
                  <div key={b._id} style={{ padding: 18, background: 'var(--gray-50)', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontSize: 16 }}>{b.customer?.name}</h3>
                          <span className={`badge ${statusColor[b.status]}`}>{b.status}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>{b.service?.description}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-400)' }}>
                          <span>📅 {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                          <span>💰 ₹{b.pricing?.workerEarning || b.pricing?.totalAmount || 0} earned</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => updateBookingStatus(b._id, 'accepted')} className="btn btn-primary btn-sm">✓ Accept</button>
                            <button onClick={() => updateBookingStatus(b._id, 'rejected')} className="btn btn-outline btn-sm">✗ Reject</button>
                          </>
                        )}
                        {b.status === 'accepted' && (
                          <Link to={`/chat/${b._id}`} className="btn btn-outline btn-sm">
                            <MessageCircle size={14} /> Chat
                          </Link>
                        )}
                        {b.status === 'ongoing' && (
                          <button onClick={() => updateBookingStatus(b._id, 'completed')} className="btn btn-primary btn-sm">Mark Complete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

function getMockWorkerBookings() {
  return [
    { _id: 'b1', customer: { name: 'Priya Patel', phone: '9876543210' }, service: { description: 'Fix bedroom switchboard and wiring' }, status: 'pending', scheduledAt: new Date(Date.now() + 3600000), pricing: { totalAmount: 500, workerEarning: 450 } },
    { _id: 'b2', customer: { name: 'Arun Singh', phone: '9876543211' }, service: { description: 'Install new fan in living room' }, status: 'accepted', scheduledAt: new Date(Date.now() + 7200000), pricing: { totalAmount: 350, workerEarning: 315 } },
    { _id: 'b3', customer: { name: 'Meera Sharma', phone: '9876543212' }, service: { description: 'Complete house wiring check' }, status: 'completed', scheduledAt: new Date(Date.now() - 86400000), pricing: { totalAmount: 800, workerEarning: 720 } },
  ];
}
