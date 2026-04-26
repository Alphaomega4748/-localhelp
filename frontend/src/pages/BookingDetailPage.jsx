import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Star, ChevronLeft, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { bookingAPI, reviewAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColor = { pending:'badge-warning', accepted:'badge-info', ongoing:'badge-orange', completed:'badge-success', cancelled:'badge-danger' };
const statusMsg = { pending:'⏳ Waiting for worker to accept', accepted:'✅ Worker accepted! Chat to coordinate.', ongoing:'🔧 Work in progress...', completed:'✅ Job completed!', cancelled:'❌ Booking cancelled' };

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: '', tags: [] });
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    bookingAPI.getById(id)
      .then(r => setBooking(r.data.booking))
      .catch(() => setBooking(getMockBooking(id)))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await reviewAPI.create({ bookingId: id, ...review });
      toast.success('Review submitted! Thank you 🙏');
      setShowReview(false);
    } catch {
      toast.success('Review submitted! (Demo)');
      setShowReview(false);
    } finally { setSubmitting(false); }
  };

  const tags = ['Professional', 'On-time', 'Clean work', 'Fair price', 'Skilled', 'Friendly'];

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!booking) return <div>Booking not found</div>;

  const { customer, worker, service, status, scheduledAt, pricing, payment, location: loc, otp } = booking;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
          <ChevronLeft size={16} /> Back
        </button>

        {/* Status banner */}
        <div style={{ padding: 16, background: status === 'completed' ? '#DCFCE7' : status === 'cancelled' ? '#FFE4E6' : 'var(--primary-light)', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 500, color: status === 'completed' ? '#166534' : status === 'cancelled' ? '#9F1239' : 'var(--primary-dark)' }}>
          {statusMsg[status] || status}
        </div>

        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 22 }}>Booking Details</h1>
            <span className={`badge ${statusColor[status]}`}>{status}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 8 }}>WORKER</div>
              <div style={{ fontWeight: 700 }}>{worker?.user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{service?.category?.replace('_', ' ')}</div>
              <a href={`tel:${worker?.user?.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--primary)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                <Phone size={13} /> {worker?.user?.phone}
              </a>
            </div>
            <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 8 }}>SCHEDULE</div>
              <div style={{ fontWeight: 700 }}>{new Date(scheduledAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6 }}>SERVICE DESCRIPTION</div>
            <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{service?.description}</p>
          </div>

          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6 }}>LOCATION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-700)' }}>
              <MapPin size={14} color="var(--primary)" /> {loc?.address || 'Address on file'}
            </div>
          </div>

          {/* Pricing */}
          <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 12 }}>PAYMENT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--gray-600)' }}>Service Amount</span>
                <span>₹{pricing?.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--gray-600)' }}>Payment Method</span>
                <span>{payment?.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--gray-200)' }}>
                <span>Payment Status</span>
                <span className={`badge ${payment?.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{payment?.status}</span>
              </div>
            </div>
          </div>

          {/* OTP for customer */}
          {otp && user?.role === 'customer' && status === 'accepted' && (
            <div style={{ padding: 16, background: '#FEF9C3', borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#854D0E', marginBottom: 8 }}>JOB START OTP (Share with worker)</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 8, color: '#854D0E' }}>{otp}</div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['accepted', 'ongoing'].includes(status) && (
              <Link to={`/chat/${booking._id}`} className="btn btn-primary">
                <MessageCircle size={16} /> Open Chat
              </Link>
            )}
            {status === 'completed' && !booking.review && user?.role === 'customer' && (
              <button onClick={() => setShowReview(true)} className="btn btn-outline">
                <Star size={16} /> Leave Review
              </button>
            )}
          </div>
        </div>

        {/* Review modal */}
        {showReview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="card" style={{ padding: 32, maxWidth: 460, width: '100%' }}>
              <h2 style={{ marginBottom: 20 }}>Rate your experience</h2>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setReview(rv => ({ ...rv, rating: r }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32 }}>
                    {r <= review.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {tags.map(t => (
                  <button key={t} onClick={() => setReview(rv => ({ ...rv, tags: rv.tags.includes(t) ? rv.tags.filter(x=>x!==t) : [...rv.tags, t] }))}
                    style={{ padding: '6px 14px', borderRadius: 999, border: '2px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 500, transition: 'all 0.2s',
                      borderColor: review.tags.includes(t) ? 'var(--primary)' : 'var(--gray-200)',
                      background: review.tags.includes(t) ? 'var(--primary-light)' : 'white',
                      color: review.tags.includes(t) ? 'var(--primary-dark)' : 'var(--gray-600)' }}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea className="input" rows={3} placeholder="Share your experience..." style={{ resize: 'none', marginBottom: 16 }}
                value={review.comment} onChange={e => setReview(rv => ({ ...rv, comment: e.target.value }))} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowReview(false)} className="btn btn-outline btn-full">Cancel</button>
                <button onClick={submitReview} className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getMockBooking(id) {
  return { _id: id, customer: { _id: 'c1', name: 'Akash Kumar Das', phone: '9876543210' }, worker: { user: { name: 'Rahul Sharma', phone: '9876543211' }, category: 'electrician' }, service: { category: 'electrician', description: 'Fix bedroom switchboard and install new socket' }, status: 'completed', scheduledAt: new Date(), location: { address: '42 Park Street, Kolkata' }, pricing: { totalAmount: 500, platformFee: 50, workerEarning: 450 }, payment: { method: 'cash', status: 'pending' }, otp: '4821' };
}
