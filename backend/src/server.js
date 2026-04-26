const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// Security & Performance
const compression = require('compression');
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const { rateLimiter } = require('./middleware/ratelimit.middleware');
app.use('/api/auth', rateLimiter(20, 60000));
app.use('/api/workers/nearby', rateLimiter(60, 60000));
app.use('/api/', rateLimiter(200, 60000));

// Database with connection pooling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localhelp', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/workers',  require('./routes/worker.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/chat',     require('./routes/chat.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reviews',  require('./routes/review.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));

// Health check with metrics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: `${Math.floor(process.uptime())}s`,
    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Socket.io
require('./socket/socket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server };
