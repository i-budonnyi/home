import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("https://backend-avtologistika.onrender.com", {
  transports: ["websocket"],
  withCredentials: true
});

export const useSocketEvent = (eventName, callback) => {
  useEffect(() => {
    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};
