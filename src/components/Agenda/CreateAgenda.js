import React, { useState } from 'react';
import axios from 'axios';

const CreateAgenda = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/agenda', { title, description, meeting_date: meetingDate, created_by: 1 });
      alert('Agenda created successfully');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required />
      <button type="submit">Create Agenda</button>
    </form>
  );
};

export default CreateAgenda;
