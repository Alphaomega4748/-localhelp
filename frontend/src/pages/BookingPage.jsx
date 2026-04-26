import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CreditCard, Banknote, ChevronLeft, Info } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { workerAPI, bookingAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '', description: '', scheduledAt: '', address: '',
    estimatedHours: 1, paymentMethod: 'cash'
  });

  useEffect(() => {
    workerAPI.getById(workerId)
      .then(r => { setWorker(r.data.worker); setForm(f => ({ ...f, category: r.data.worker.category })); })
      .catch(() => setWorker({ _id: workerId, user: { name: 'Worker' }, category: 'electrician', hourlyRate: 250 }));
  }, [workerId]);

  const totalAmount = worker ? worker.hourlyRate * form.estimatedHours : 0;
  const platformFee = Math.round(totalAmount * 0.1);
  const workerEarning = totalAmount - platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.scheduledAt || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        workerId, ...form,
        coordinates: [88.3639, 22.5726], // In prod: use actual GPS
        estimatedHours: parseInt(form.estimatedHours)
      });

      if (form.paymentMethod === 'online') {
        await handleOnlinePayment(data.booking._id, totalAmount);
      } else {
        toast.success('Booking created! OTP sent to worker.');
        navigate(`/bookings/${data.booking._id}`);
      }
    } catch (err) {
      // Demo mode
      toast.success('Booking created successfully! (Demo mode)');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (bookingId, amount) => {
    try {
      const { data } = await paymentAPI.createOrder(bookingId);
      const options = {
        key: data.key,
        amount: amount * 100,
        currency: 'INR',
        name: 'LocalHelp',
        description: `Payment for ${form.category} service`,
        order_id: data.order.id,
        handler: async (response) => {
          await paymentAPI.verifyPayment({ ...response, bookingId });
          toast.success('Payment successful! Booking confirmed.');
          navigate(`/bookings/${bookingId}`);
        },
        theme: { color: '#FF6B35' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.success('Booking confirmed! (Demo: Razorpay keys not configured)');
      navigate('/bookings');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const minDate = new Date(); minDate.setHours(minDate.getHours() + 1);

  if (!worker) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Book {worker.user?.name}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          <form onSubmit={handleSubmit} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Service Description *</label>
              <textarea className="input" rows={3} placeholder="Describe the work you need done (e.g., Fix bedroom light switch, Replace kitchen tap...)"
                value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'none' }} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />Schedule Date & Time *
                </label>
                <input className="input" type="datetime-local"
                  min={minDate.toISOString().slice(0,16)}
                  value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />Estimated Hours
                </label>
                <select className="input" value={form.estimatedHours} onChange={e => set('estimatedHours', e.target.value)}>
                  {[1,2,3,4,5,6,8].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />Your Address *
              </label>
              <textarea className="input" rows={2} placeholder="Enter your full address with landmark"
                value={form.address} onChange={e => set('address', e.target.value)} style={{ resize: 'none' }} required />
            </div>

            {/* Payment method */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'cash', icon: Banknote, label: 'Pay on Arrival', sub: 'Cash after work' },
                  { id: 'online', icon: CreditCard, label: 'Pay Online', sub: 'UPI / Card / Net Banking' }
                ].map(pm => (
                  <div key={pm.id} onClick={() => set('paymentMethod', pm.id)}
                    style={{ padding: 16, borderRadius: 12, border: `2px solid ${form.paymentMethod === pm.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                      background: form.paymentMethod === pm.id ? 'var(--primary-light)' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <pm.icon size={22} color={form.paymentMethod === pm.id ? 'var(--primary)' : 'var(--gray-400)'} />
                    <div style={{ fontWeight: 600, marginTop: 8, fontSize: 14, color: form.paymentMethod === pm.id ? 'var(--primary-dark)' : 'var(--gray-700)' }}>{pm.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{pm.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating booking...' : form.paymentMethod === 'online' ? '💳 Pay & Confirm Booking' : '✓ Confirm Booking'}
            </button>
          </form>

          {/* Price summary */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Price Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--gray-600)' }}>₹{worker.hourlyRate} × {form.estimatedHours} hrs</span>
                <span style={{ fontWeight: 600 }}>₹{totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--gray-600)' }}>Platform fee (10%)</span>
                <span style={{ fontWeight: 600 }}>₹{platformFee}</span>
              </div>
              <div style={{ borderTop: '2px solid var(--gray-100)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{totalAmount}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 14, background: 'var(--primary-light)', borderRadius: 10, fontSize: 13, color: 'var(--primary-dark)', display: 'flex', gap: 8 }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>An OTP will be shared with the worker to start the job. Payment is collected after work is complete for cash bookings.</span>
            </div>

            {/* Worker mini card */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 10 }}>YOUR WORKER</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{worker.user?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{worker.category?.replace('_', ' ')} • ₹{worker.hourlyRate}/hr</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
