import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, MapPin } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { joinBooking, sendMessage, onEvent } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [booking, setBooking] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load booking & messages
    api.get(`/api/bookings/${bookingId}`)
      .then(r => setBooking(r.data.booking))
      .catch(() => setBooking({ _id: bookingId, customer: { _id: 'c1', name: 'You' }, worker: { user: { name: 'Rahul Sharma', _id: 'w1' } } }));

    api.get(`/api/chat/${bookingId}`)
      .then(r => setMessages(r.data.messages))
      .catch(() => setMessages(getMockMessages()));

    joinBooking(bookingId);

    // Listen for new messages
    const cleanup = onEvent('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return cleanup;
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const otherId = user?.role === 'customer' ? booking?.worker?.user?._id : booking?.customer?._id;

    // Optimistic update
    const tempMsg = { _id: Date.now(), sender: { _id: user?._id, name: user?.name }, message: input, createdAt: new Date(), isOptimistic: true };
    setMessages(prev => [...prev, tempMsg]);

    sendMessage({ bookingId, receiverId: otherId, message: input });
    setInput('');
  };

  const otherName = user?.role === 'customer' ? booking?.worker?.user?.name : booking?.customer?.name;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>
      <Navbar />

      {/* Chat header */}
      <div style={{ background: 'white', padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {user?.role === 'customer' ? '🔧' : '👤'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{otherName || 'Loading...'}</div>
          <div style={{ fontSize: 12, color: '#06D6A0', fontWeight: 600 }}>● Online</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ gap: 4 }}>
            <MapPin size={14} /> Track
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Date divider */}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', margin: '8px 0' }}>
          Today
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user?._id || msg.sender?._id === 'me';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                  {msg.sender?.name?.[0] || '?'}
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                <div style={{ padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'var(--primary)' : 'white',
                  color: isMe ? 'white' : 'var(--gray-800)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: 14, lineHeight: 1.5 }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && msg.isOptimistic && ' • Sending...'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'white', padding: '16px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <input className="input" style={{ flex: 1, borderRadius: 999 }}
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} className="btn btn-primary" style={{ borderRadius: '50%', width: 46, height: 46, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function getMockMessages() {
  return [
    { _id: 1, sender: { _id: 'other', name: 'Rahul' }, message: 'Hello! I received your booking request.', createdAt: new Date(Date.now() - 300000) },
    { _id: 2, sender: { _id: 'me', name: 'You' }, message: 'Hi Rahul! Can you come around 5 PM?', createdAt: new Date(Date.now() - 240000) },
    { _id: 3, sender: { _id: 'other', name: 'Rahul' }, message: 'Yes, 5 PM works perfectly. I will bring all necessary tools.', createdAt: new Date(Date.now() - 180000) },
    { _id: 4, sender: { _id: 'me', name: 'You' }, message: 'Great! My address is 42, Park Street. Please call before coming.', createdAt: new Date(Date.now() - 120000) },
    { _id: 5, sender: { _id: 'other', name: 'Rahul' }, message: "Sure, I'll call you when I'm on the way. See you at 5! 👍", createdAt: new Date(Date.now() - 60000) },
  ];
}
