import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [logs, setLogs] = useState([]);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add a new comment
  const addComment = async (taskId) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/comments`, {
        task_id: taskId,
        user_id: 1, // Example user ID
        comment: newComment,
      });
      alert('Comment added!');
      setNewComment('');
      fetchLogs(taskId); // Refresh logs
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Fetch task logs
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
    <div>
      <h1>Task Management</h1>
      <div>
        <h2>Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> - {task.status}
              <button onClick={() => {
                setSelectedTask(task);
                fetchLogs(task.id);
              }}>View Details</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedTask && (
        <div>
          <h2>Task Details: {selectedTask.title}</h2>
          <p><strong>Description:</strong> {selectedTask.description}</p>

          <div>
            <h3>Add Comment</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={() => addComment(selectedTask.id)}>Submit Comment</button>
          </div>

          <div>
            <h3>Task Logs</h3>
            <ul>
              {logs.map((log) => (
                <li key={log.id}>
                  [{log.log_time}] {log.action}
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
