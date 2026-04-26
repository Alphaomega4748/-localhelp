const { Message } = require('../models/ChatReview');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);
    onlineUsers.set(socket.user._id.toString(), socket.id);

    // Join booking room
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    // Send chat message
    socket.on('send_message', async ({ bookingId, receiverId, message, type }) => {
      try {
        const msg = await Message.create({
          booking: bookingId,
          sender: socket.user._id,
          receiver: receiverId,
          message,
          type: type || 'text'
        });
        await msg.populate('sender', 'name avatar');

        // Emit to booking room
        io.to(`booking_${bookingId}`).emit('receive_message', msg);

        // Notify if receiver is online but in different room
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', {
            bookingId, senderName: socket.user.name, message
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Worker live location update
    socket.on('update_location', ({ bookingId, lat, lng }) => {
      socket.to(`booking_${bookingId}`).emit('worker_location', { lat, lng });
    });

    // Booking status updates
    socket.on('booking_status_update', ({ bookingId, status, userId }) => {
      const userSocketId = onlineUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit('booking_updated', { bookingId, status });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async ({ bookingId }) => {
      await Message.updateMany(
        { booking: bookingId, receiver: socket.user._id },
        { isRead: true }
      );
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user._id.toString());
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};
