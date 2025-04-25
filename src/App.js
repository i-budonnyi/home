import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios
      .get("https://backend-avtologistika.onrender.com/api/tasks")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("❌ Помилка:", err));
  }, []);

  return (
    <div>
      <h1>Список задач</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
