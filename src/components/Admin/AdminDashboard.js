import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate(); // Added for redirecting to other pages
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [storageUsage, setStorageUsage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fields for creating a new user
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "" });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Check if token exists
        if (!token) {
          setError("Please log in.");
          navigate("/login"); // Redirect to login page
          return;
        }

        // Fetching data from the backend
        const [usersResponse, rolesResponse, storageResponse] = await Promise.all([
          axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/storage", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUsers(usersResponse.data.users || []);
        setRoles(rolesResponse.data.roles || []);
        setStorageUsage(storageResponse.data || {});
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]); // Added "navigate" as a dependency

  // Handle changing user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Error changing role:", err.message);
    }
  };

  // Handle blocking/unblocking a user
  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/users/${userId}/block`,
        { isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isBlocked } : user
        )
      );
    } catch (err) {
      console.error("Error blocking user:", err.message);
    }
  };

  // Handle resetting user password
  const handleResetPassword = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/admin/users/${userId}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`New password: ${response.data.newPassword}`);
    } catch (err) {
      console.error("Error resetting password:", err.message);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err.message);
    }
  };

  // Handle creating a new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/admin/users",
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => [...prev, response.data.user]);
      setNewUser({ username: "", email: "", password: "", role: "" });
      alert("User created successfully.");
    } catch (err) {
      console.error("Error creating user:", err.message);
    }
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Server Statistics</h2>
        <p>Storage usage: {storageUsage.used || 0} / {storageUsage.total || 0} GB</p>
        <p>Website load: {storageUsage.load || "Unknown"}%</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Block</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => handleBlockUser(user.id, !user.isBlocked)}>
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleResetPassword(user.id)}>
                    Reset Password
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser}>
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
