import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Shield, Phone, ChevronLeft, CheckCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { workerAPI } from '../utils/api';

const categoryIcons = { electrician:'⚡', plumber:'🔧', carpenter:'🪚', painter:'🎨', cleaner:'🧹', mechanic:'🔩', helper:'👷', ac_repair:'❄️', pest_control:'🐛' };

export default function WorkerDetailPage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [wRes, rRes] = await Promise.all([workerAPI.getById(id), workerAPI.getReviews(id)]);
        setWorker(wRes.data.worker);
        setReviews(rRes.data.reviews);
      } catch {
        // Mock data
        setWorker(getMockWorker(id));
        setReviews(getMockReviews());
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!worker) return <div>Worker not found</div>;

  const { user, category, rating, totalReviews, hourlyRate, isAvailable, experience, bio, skills = [], isOnline } = worker;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
          <ChevronLeft size={16} /> Back
        </button>

        {/* Profile card */}
        <div className="card" style={{ padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: 24, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {categoryIcons[category] || '🛠️'}
              </div>
              {isOnline && <div style={{ position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#06D6A0', border: '3px solid white' }} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 28 }}>{user?.name}</h1>
                {worker.isVerified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1E40AF', fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle size={16} fill="#1E40AF" color="white" /> Verified
                  </span>
                )}
                <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>{isAvailable ? 'Available Now' : 'Busy'}</span>
              </div>

              <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>

              <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.round(rating) ? '#FFD166' : 'none'} color={i <= Math.round(rating) ? '#FFD166' : '#D1D5DB'} />)}
                  <strong>{rating.toFixed(1)}</strong>
                  <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>({totalReviews} reviews)</span>
                </div>
                <div style={{ color: 'var(--gray-500)', fontSize: 14 }}><Clock size={14} /> {experience} years exp</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--secondary)' }}>₹{hourlyRate}</div>
              <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>per hour</div>
              {isAvailable && (
                <Link to={`/book/${worker._id}`} className="btn btn-primary" style={{ marginTop: 12 }}>
                  Book Now →
                </Link>
              )}
            </div>
          </div>

          {bio && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>About</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>{bio}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Skills</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {skills.map(s => <span key={s} className="badge badge-info">{s}</span>)}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--gray-100)' }}>
            {[
              { label: 'Jobs Done', value: worker.totalBookings || 0 },
              { label: 'Rating', value: `${rating.toFixed(1)}★` },
              { label: 'Response', value: '< 5 min' }
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Customer Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 32 }}>No reviews yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                      {r.customer?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customer?.name || 'Customer'}</div>
                      <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= r.rating ? '#FFD166' : 'none'} color={i <= r.rating ? '#FFD166' : '#D1D5DB'} />)}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-400)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>{r.comment}</p>
                  {r.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {r.tags.map(t => <span key={t} className="badge badge-info" style={{ fontSize: 11 }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMockWorker(id) {
  const workers = {
    '1': { _id: '1', user: { name: 'Rahul Sharma', phone: '9876543210' }, category: 'electrician', rating: 4.9, totalReviews: 128, hourlyRate: 250, isAvailable: true, isOnline: true, experience: 8, bio: 'Certified electrician with 8 years of experience.', skills: ['Wiring', 'Switchboard', 'Inverter', 'Solar'], totalBookings: 450, isVerified: true },
  };
  return workers[id] || workers['1'];
}
function getMockReviews() {
  return [
    { customer: { name: 'Priya Patel' }, rating: 5, comment: 'Excellent work! Fixed the wiring issue in no time. Very professional.', tags: ['Professional', 'On-time', 'Clean work'], createdAt: new Date() },
    { customer: { name: 'Arun Kumar' }, rating: 4, comment: 'Good work, came on time and solved the problem efficiently.', tags: ['Reliable', 'Fair price'], createdAt: new Date() },
  ];
}
