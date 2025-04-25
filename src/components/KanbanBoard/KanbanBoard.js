import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [newTaskContent, setNewTaskContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Завантаження завдань з бекенду
  useEffect(() => {
    axios.get('http://192.168.0.116:5000/api/tasks') // Замість цього вкажіть свій API endpoint
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Помилка при завантаженні завдань", error);
        setLoading(false);
      });
  }, []);

  // Функція для обробки завершення перетягування
  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return; // Якщо елемент не переміщено

    // Якщо завдання переміщено в тій самій колонці
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumn = source.droppableId;
    const destinationColumn = destination.droppableId;
    const sourceTasks = Array.from(tasks[sourceColumn]);
    const [movedTask] = sourceTasks.splice(source.index, 1); // Витягуємо завдання з початкової колонки

    const destinationTasks = Array.from(tasks[destinationColumn]);
    destinationTasks.splice(destination.index, 0, movedTask); // Додаємо завдання в нову колонку

    // Оновлення стану та збереження змін на бекенді
    const updatedTasks = {
      ...tasks,
      [sourceColumn]: sourceTasks,
      [destinationColumn]: destinationTasks,
    };
    setTasks(updatedTasks);
    
    // Викликаємо API для збереження нової позиції завдання на сервері
    axios.put('http://192.168.0.116:5000/api/tasks', updatedTasks)
      .then(response => {
        console.log('Завдання оновлено на сервері');
      })
      .catch(error => {
        console.error('Помилка при оновленні завдань на сервері', error);
      });
  };

  // Додавання нового завдання
  const addNewTask = () => {
    if (!newTaskContent) return;

    const newTask = {
      id: `${Date.now()}`, // Використовуємо timestamp як ID
      content: newTaskContent,
    };

    const updatedTasks = {
      ...tasks,
      todo: [...tasks.todo, newTask], // Додаємо нове завдання до колонки "To Do"
    };
    setTasks(updatedTasks);
    setNewTaskContent('');

    // Збереження нового завдання на сервері
    axios.post('http://192.168.0.116:5000/api/tasks', newTask)
      .then(response => {
        console.log('Завдання додано на сервері');
      })
      .catch(error => {
        console.error('Помилка при додаванні завдання на сервері', error);
      });
  };

  // Видалення завдання
  const deleteTask = (taskId, column) => {
    const updatedColumn = tasks[column].filter(task => task.id !== taskId);
    const updatedTasks = { ...tasks, [column]: updatedColumn };
    setTasks(updatedTasks);

    // Видалення завдання з серверу
    axios.delete(`http://192.168.0.116:5000/api/tasks/${taskId}`)
      .then(response => {
        console.log('Завдання видалено на сервері');
      })
      .catch(error => {
        console.error('Помилка при видаленні завдання з серверу', error);
      });
  };

  if (loading) {
    return <div>Завантаження...</div>;
  }

  return (
    <div style={styles.board}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Колонка "To Do" */}
        <Droppable droppableId="todo">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ ...styles.column, backgroundColor: '#f4f7fa' }}
            >
              <h3>To Do</h3>
              {tasks.todo.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...styles.task, ...provided.draggableProps.style }}
                    >
                      {task.content}
                      <button onClick={() => deleteTask(task.id, 'todo')}>Видалити</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Колонка "In Progress" */}
        <Droppable droppableId="inProgress">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ ...styles.column, backgroundColor: '#e1f7d5' }}
            >
              <h3>In Progress</h3>
              {tasks.inProgress.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...styles.task, ...provided.draggableProps.style }}
                    >
                      {task.content}
                      <button onClick={() => deleteTask(task.id, 'inProgress')}>Видалити</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Колонка "Done" */}
        <Droppable droppableId="done">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ ...styles.column, backgroundColor: '#c8e6c9' }}
            >
              <h3>Done</h3>
              {tasks.done.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...styles.task, ...provided.draggableProps.style }}
                    >
                      {task.content}
                      <button onClick={() => deleteTask(task.id, 'done')}>Видалити</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Форма для додавання нового завдання */}
      <div style={styles.newTaskInput}>
        <input
          type="text"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          placeholder="Додати нове завдання..."
        />
        <button onClick={addNewTask}>Додати завдання</button>
      </div>
    </div>
  );
};

// Стилі
const styles = {
  board: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  column: {
    width: '30%',
    backgroundColor: '#e0e0e0',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  task: {
    backgroundColor: '#ffffff',
    margin: '8px',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  newTaskInput: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default KanbanBoard;
