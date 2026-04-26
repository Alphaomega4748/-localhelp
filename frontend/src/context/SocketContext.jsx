import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token && user) {
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socketRef.current.on('connect', () => setIsConnected(true));
      socketRef.current.on('disconnect', () => setIsConnected(false));

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [token, user]);

  const joinBooking = (bookingId) => {
    socketRef.current?.emit('join_booking', bookingId);
  };

  const sendMessage = (data) => {
    socketRef.current?.emit('send_message', data);
  };

  const updateLocation = (data) => {
    socketRef.current?.emit('update_location', data);
  };

  const onEvent = (event, cb) => {
    socketRef.current?.on(event, cb);
    return () => socketRef.current?.off(event, cb);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinBooking, sendMessage, updateLocation, onEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
