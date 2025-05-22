import { useEffect } from 'react';
import { io } from 'socket.io-client';

// ✅ 1. Ініціалізація WebSocket-підключення
export const socket = io("https://backend-avtologistika.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

// ✅ 2. Хук для підписки на події
export const useSocketEvent = (eventName, callback) => {
  useEffect(() => {
    if (!eventName || typeof callback !== "function") return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};
