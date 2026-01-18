import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection to custom server
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      if (userId) {
        socketRef.current.emit('join', userId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
}