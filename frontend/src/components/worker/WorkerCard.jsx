import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, Zap } from 'lucide-react';

const categoryColors = {
  electrician:  { color: '#6366F1', bg: '#EEF2FF', emoji: '⚡' },
  plumber:      { color: '#06B6D4', bg: '#ECFEFF', emoji: '🔧' },
  carpenter:    { color: '#F59E0B', bg: '#FFFBEB', emoji: '🪚' },
  painter:      { color: '#8B5CF6', bg: '#F5F3FF', emoji: '🎨' },
  cleaner:      { color: '#10B981', bg: '#ECFDF5', emoji: '🧹' },
  mechanic:     { color: '#64748B', bg: '#F8FAFC', emoji: '🔩' },
  helper:       { color: '#F97316', bg: '#FFF7ED', emoji: '👷' },
  ac_repair:    { color: '#0EA5E9', bg: '#F0F9FF', emoji: '❄️' },
  pest_control: { color: '#EF4444', bg: '#FEF2F2', emoji: '🐛' },
  other:        { color: '#64748B', bg: '#F8FAFC', emoji: '🛠️' },
};

export default function WorkerCard({ worker, delay = 0 }) {
  const { user, category, rating, totalReviews, hourlyRate, isAvailable, isOnline, distance, experience, bio, isVerified } = worker;
  const cat = categoryColors[category] || categoryColors.other;

  return (
    <div className="card card-hover fade-up" style={{ padding: 20, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: `1.5px solid ${cat.color}22` }}>
            {cat.emoji}
          </div>
          {isOnline && (
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 13, height: 13, background: '#10B981', borderRadius: '50%', border: '2px solid white' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </h3>
            {isVerified && <CheckCircle size={14} color="#10B981" fill="#10B981" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: cat.bg, color: cat.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {experience > 0 && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{experience} yrs exp</span>}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="stars">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} color={i <= Math.round(rating) ? '#F59E0B' : '#CBD5E1'} />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{rating.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>({totalReviews})</span>
          </div>
        </div>

        {/* Availability */}
        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ flexShrink: 0 }}>
          {isAvailable ? '● Available' : '● Busy'}
        </span>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
          {bio}
        </p>
      )}

      <div className="divider" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', align: 'center', gap: 14 }}>
          {distance && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-500)' }}>
              <MapPin size={13} color={cat.color} />
              {distance} km
            </div>
          )}
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>₹{hourlyRate}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>/hr</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/workers/${worker._id}`} className="btn btn-ghost btn-sm">Profile</Link>
          {isAvailable && <Link to={`/book/${worker._id}`} className="btn btn-primary btn-sm">Book <Zap size={12} fill="white" /></Link>}
        </div>
      </div>
    </div>
  );
}
