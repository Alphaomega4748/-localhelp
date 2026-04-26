import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './styles/global.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WorkerDetailPage from './pages/WorkerDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ChatPage from './pages/ChatPage';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'worker' ? '/worker/dashboard' : user.role === 'admin' ? '/admin' : '/home'} />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Customer routes */}
      <Route path="/home" element={<PrivateRoute role="customer"><HomePage /></PrivateRoute>} />
      <Route path="/workers/:id" element={<PrivateRoute><WorkerDetailPage /></PrivateRoute>} />
      <Route path="/book/:workerId" element={<PrivateRoute role="customer"><BookingPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
      <Route path="/bookings/:id" element={<PrivateRoute><BookingDetailPage /></PrivateRoute>} />
      <Route path="/chat/:bookingId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Worker routes */}
      <Route path="/worker/dashboard" element={<PrivateRoute role="worker"><WorkerDashboard /></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'Outfit, sans-serif', borderRadius: '12px' },
            success: { iconTheme: { primary: '#06D6A0', secondary: 'white' } },
            error: { iconTheme: { primary: '#EF476F', secondary: 'white' } }
          }} />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
