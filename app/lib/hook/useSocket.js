import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io({
      path: '/api/socket',
      autoConnect: true
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socketRef.current.emit('join', userId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
}