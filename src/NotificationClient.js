import { useEffect, useState } from "react";

const NotificationClient = ({ userId }) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8080/?userId=${userId}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setMessage(data.message);
      }
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return message ? <div style={{ backgroundColor: "yellow" }}>🔔 {message}</div> : null;
};

export default NotificationClient;
