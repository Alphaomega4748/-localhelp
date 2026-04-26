import { Link } from 'react-router-dom';
import { Zap, Shield, Star, MapPin, ChevronRight, Wrench, Droplets, Paintbrush, Plug, Wind, Bug, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react';

const categories = [
  { icon: Plug,        label: 'Electrician',  color: '#6366F1', bg: '#EEF2FF', desc: 'Wiring, repairs & more' },
  { icon: Droplets,    label: 'Plumber',      color: '#06B6D4', bg: '#ECFEFF', desc: 'Pipes, taps & drainage' },
  { icon: Paintbrush,  label: 'Painter',      color: '#8B5CF6', bg: '#F5F3FF', desc: 'Interior & exterior' },
  { icon: Wrench,      label: 'Carpenter',    color: '#F59E0B', bg: '#FFFBEB', desc: 'Furniture & woodwork' },
  { icon: Wind,        label: 'AC Repair',    color: '#10B981', bg: '#ECFDF5', desc: 'Service & installation' },
  { icon: Bug,         label: 'Pest Control', color: '#EF4444', bg: '#FEF2F2', desc: 'Home & office' },
];

const stats = [
  { icon: Users,     value: '10,000+', label: 'Verified Workers' },
  { icon: Star,      value: '4.9★',    label: 'Average Rating' },
  { icon: Clock,     value: '< 5 min', label: 'Response Time' },
  { icon: TrendingUp,value: '50,000+', label: 'Happy Customers' },
];

const features = [
  { icon: Zap,   title: 'Instant Booking',     desc: 'Book in under 2 minutes, 24/7. No waiting, no calls needed.' },
  { icon: Shield,title: 'Verified Professionals',desc: 'Every worker is background-checked and ID verified.' },
  { icon: Star,  title: 'Quality Guaranteed',  desc: 'Free re-service or full refund — no questions asked.' },
];

const reviews = [
  { name: 'Priya Sharma', role: 'Customer', text: 'Booked an electrician in 3 minutes. Showed up on time, fixed everything perfectly. Highly recommend!', rating: 5 },
  { name: 'Arun Kumar',   role: 'Customer', text: 'Way better than Urban Company in my area. Local workers, faster response, and cheaper!', rating: 5 },
  { name: 'Meera Singh',  role: 'Customer', text: 'The real-time chat feature is amazing. Could coordinate with the plumber before he arrived.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #F1F5F9', padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color="white" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: '#0F172A', letterSpacing: '-0.03em' }}>LocalHelp</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 5% 72px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', color: '#6366F1', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <Zap size={13} fill="#6366F1" />
            Now live in your city
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 5vw, 60px)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: 20, lineHeight: 1.08 }}>
            Local experts,<br />
            <span className="gradient-text">one tap away.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#64748B', marginBottom: 36, lineHeight: 1.7, maxWidth: 460 }}>
            Book trusted electricians, plumbers, carpenters & more in minutes. Real-time tracking, transparent pricing, quality guaranteed.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link to="/register" className="btn btn-primary btn-xl">
              Book a Service <ChevronRight size={18} />
            </Link>
            <Link to="/register?role=worker" className="btn btn-ghost btn-xl">
              Join as Worker
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero card mockup */}
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)', borderRadius: 28, padding: 28, border: '1px solid #E2E8F0' }}>
            {/* Worker card */}
            <div className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Plug size={22} color="#6366F1" />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10B981', borderRadius: '50%', border: '2px solid white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Rahul Sharma</div>
                  <div style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={11} color="#6366F1" /> 1.2 km away
                  </div>
                </div>
                <div style={{ background: '#EEF2FF', color: '#6366F1', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  ⭐ 4.9
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {['Wiring', 'Switchboard', 'Inverter'].map(s => (
                  <span key={s} style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>₹250</span>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>/hour</span>
                </div>
                <Link to="/register" className="btn btn-primary btn-sm">Book Now →</Link>
              </div>
            </div>
            {/* Live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              <div style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>5 workers available near you</span>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>Live</span>
            </div>
          </div>
          {/* Floating chips */}
          <div style={{ position: 'absolute', top: -16, right: -16, background: '#10B981', color: 'white', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
            ✓ Verified
          </div>
          <div style={{ position: 'absolute', bottom: -12, left: -12, background: '#6366F1', color: 'white', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
            💳 Razorpay
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 5%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, letterSpacing: '-0.02em', marginBottom: 12 }}>What do you need?</h2>
            <p style={{ fontSize: 17, color: '#64748B' }}>Choose from our verified service professionals</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {categories.map(({ icon: Icon, label, color, bg, desc }) => (
              <Link to="/register" key={label} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Icon size={26} color={color} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 5%', background: '#0F172A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, color: 'white', letterSpacing: '-0.02em', marginBottom: 12 }}>Why choose LocalHelp?</h2>
            <p style={{ fontSize: 17, color: '#64748B' }}>Built for reliability, designed for simplicity</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ padding: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={22} color="white" />
                </div>
                <h3 style={{ color: 'white', fontSize: 19, marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: '64px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, letterSpacing: '-0.02em', marginBottom: 12 }}>Loved by customers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {reviews.map((r) => (
              <div key={r.name} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(r.rating)].map((_, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 15 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#6366F1' }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{r.role}</div>
                  </div>
                  <CheckCircle size={16} color="#10B981" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 44, color: 'white', letterSpacing: '-0.02em', marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to get started?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 36 }}>Join 50,000+ customers who trust LocalHelp</p>
        <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#6366F1', fontWeight: 700, fontSize: 16 }}>
          Book Your First Service <ChevronRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #F1F5F9', padding: '24px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: 13 }}>
        <span>© 2024 LocalHelp. Built with ❤️</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Support'].map(t => <span key={t} style={{ cursor: 'pointer' }}>{t}</span>)}
        </div>
      </footer>
    </div>
  );
}
