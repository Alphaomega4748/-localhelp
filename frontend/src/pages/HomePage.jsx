import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, Zap } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import WorkerCard from '../components/worker/WorkerCard';
import { workerAPI } from '../utils/api';

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'painter', label: 'Painter', emoji: '🎨' },
  { id: 'cleaner', label: 'Cleaner', emoji: '🧹' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'ac_repair', label: 'AC Repair', emoji: '❄️' },
  { id: 'pest_control', label: 'Pest Control', emoji: '🐛' },
];

export default function HomePage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState({ lat: 22.5726, lng: 88.3639 });
  const [locationName, setLocationName] = useState('Detecting...');
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationName('Current location'); },
      () => setLocationName('Kolkata, WB')
    );
  }, []);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await workerAPI.getNearby({ lat: location.lat, lng: location.lng, category, radius });
      setWorkers(data.workers || []);
    } catch {
      setWorkers(getMockWorkers());
    } finally { setLoading(false); }
  }, [location, category, radius]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const filtered = workers
    .filter(w => !search || w.user?.name?.toLowerCase().includes(search.toLowerCase()) || w.category?.includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'price' ? a.hourlyRate - b.hourlyRate : (a.distance || 0) - (b.distance || 0));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />

      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', padding: '32px 20px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: 26, marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            Find Workers Near You
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 18 }}>
            <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{locationName}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input className="input" style={{ paddingLeft: 42, borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                placeholder="Electrician, plumber, carpenter..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: 100, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
              value={radius} onChange={e => setRadius(e.target.value)}>
              {[2,5,10,20,50].map(r => <option key={r} value={r} style={{ color: '#0F172A' }}>{r} km</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', padding: '0 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto', padding: '12px 0' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                background: category === cat.id ? 'var(--primary)' : 'var(--gray-100)',
                color: category === cat.id ? 'white' : 'var(--gray-600)',
                boxShadow: category === cat.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
            {loading ? 'Finding workers...' : <><strong style={{ color: 'var(--gray-800)' }}>{filtered.length}</strong> workers found</>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={14} color="var(--gray-400)" />
            <select className="input" style={{ width: 'auto', fontSize: 13, padding: '6px 12px' }}
              value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="distance">Nearest first</option>
              <option value="rating">Highest rated</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, height: 200, border: '1px solid var(--gray-100)', animation: 'pulse 1.5s ease infinite', opacity: 0.6 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No workers found</h3>
            <p>Try expanding your search radius or a different category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map((worker, i) => <WorkerCard key={worker._id} worker={worker} delay={i * 60} />)}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

function getMockWorkers() {
  return [
    { _id:'1', user:{name:'Rahul Sharma', phone:'9876543210'}, category:'electrician', rating:4.9, totalReviews:128, hourlyRate:250, isAvailable:true, isOnline:true, distance:1.2, experience:8, bio:'Certified electrician with 8 years experience. Wiring, switchboard repair, inverter installation.' },
    { _id:'2', user:{name:'Suresh Kumar', phone:'9876543211'}, category:'plumber', rating:4.7, totalReviews:95, hourlyRate:200, isAvailable:true, isOnline:true, distance:2.5, experience:5, bio:'Expert in pipe fittings, bathroom fittings, water pump repair. Fast and reliable.' },
    { _id:'3', user:{name:'Mohan Das', phone:'9876543212'}, category:'carpenter', rating:4.8, totalReviews:76, hourlyRate:300, isAvailable:true, isOnline:false, distance:3.1, experience:10, bio:'Furniture making, door repair, modular kitchen installation. Quality guaranteed.' },
    { _id:'4', user:{name:'Priya Singh', phone:'9876543213'}, category:'cleaner', rating:4.6, totalReviews:210, hourlyRate:150, isAvailable:true, isOnline:true, distance:0.8, experience:3, bio:'Deep cleaning, housekeeping, sofa/carpet cleaning. Eco-friendly products.' },
    { _id:'5', user:{name:'Ravi Yadav', phone:'9876543214'}, category:'ac_repair', rating:4.9, totalReviews:142, hourlyRate:350, isAvailable:true, isOnline:true, distance:2.0, experience:6, bio:'AC installation, servicing, gas refilling. All brands. Same day service.' },
    { _id:'6', user:{name:'Amit Verma', phone:'9876543215'}, category:'painter', rating:4.5, totalReviews:58, hourlyRate:280, isAvailable:false, isOnline:false, distance:4.2, experience:7, bio:'Interior & exterior painting, POP work and texture painting specialist.' },
  ];
}
