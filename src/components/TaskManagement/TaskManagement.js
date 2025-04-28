import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Виправлений API
const API_URL = 'https://idea-backend.onrender.com';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [logs, setLogs] = useState([]);

  // Отримати всі задачі
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Додати новий коментар
  const addComment = async (taskId) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/comments`, {
        task_id: taskId,
        user_id: 1, // Приклад user_id (потім можна взяти реальний з токену)
        comment: newComment,
      });
      alert('✅ Коментар додано!');
      setNewComment('');
      fetchLogs(taskId); // Оновити логи після додавання коментаря
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Отримати логи задачі
  const fetchLogs = async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Управління Завданнями</h1>

      <div>
        <h2>Список Завдань</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: '10px' }}>
              <strong>{task.title}</strong> — {task.status}
              <button
                onClick={() => {
                  setSelectedTask(task);
                  fetchLogs(task.id);
                }}
                style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
              >
                Деталі
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedTask && (
        <div style={{ marginTop: '30px' }}>
          <h2>Деталі Завдання: {selectedTask.title}</h2>
          <p><strong>Опис:</strong> {selectedTask.description}</p>

          <div style={{ marginTop: '20px' }}>
            <h3>Додати Коментар</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ width: '100%', height: '80px', marginBottom: '10px' }}
            />
            <br />
            <button
              onClick={() => addComment(selectedTask.id)}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Надіслати коментар
            </button>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Логи Завдання</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {logs.map((log) => (
                <li key={log.id}>
                  [{new Date(log.log_time).toLocaleString()}] — {log.action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
