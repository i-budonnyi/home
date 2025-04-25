import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AgendaItems = ({ agendaId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await axios.get(`/agenda/${agendaId}/items`);
      setItems(response.data);
    };
    fetchItems();
  }, [agendaId]);

  const updateStatus = async (itemId, status) => {
    try {
      await axios.put(`/agenda/items/${itemId}`, { status });
      alert('Status updated successfully');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.description} - {item.status}
          <button onClick={() => updateStatus(item.id, 'reviewed')}>Mark as Reviewed</button>
        </li>
      ))}
    </ul>
  );
};

export default AgendaItems;
