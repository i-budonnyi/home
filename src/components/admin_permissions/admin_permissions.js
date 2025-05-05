import React, { useState, useEffect } from "react";

const API_URL = "https://backend-avtologistika.onrender.com/api";

const AdminPermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [adminId, setAdminId] = useState("");
  const [permissionId, setPermissionId] = useState("");
  const [deleteAdminId, setDeleteAdminId] = useState("");
  const [deletePermissionId, setDeletePermissionId] = useState("");

  const fetchAdminPermissions = async () => {
    try {
      const response = await fetch(`${API_URL}/admin_permissions`);
      const data = await response.json();
      setPermissions(data || []);
    } catch (error) {
      console.error("❌ Помилка отримання прав:", error);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    const payload = {
      admin_id: adminId,
      permission_id: permissionId,
      assigned_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/admin_permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("❌ Неможливо створити звʼязок.");
      const result = await response.json();
      alert("✅ Право призначено: " + JSON.stringify(result));
      fetchAdminPermissions();
    } catch (error) {
      console.error("❌ Помилка створення:", error);
    }
  };

  const handleDeletePermission = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_URL}/admin_permissions/${deleteAdminId}/${deletePermissionId}`,
        { method: "DELETE" }
      );
      if (response.status === 204) {
        alert("✅ Право успішно видалено.");
        fetchAdminPermissions();
      } else {
        const error = await response.json();
        alert("⚠️ Помилка видалення: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("❌ Помилка видалення:", error);
    }
  };

  useEffect(() => {
    fetchAdminPermissions();
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ color: "#003366", textAlign: "center" }}>Керування правами адміністраторів</h1>

      <section>
        <h2>🔒 Існуючі призначення</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#003366", color: "#fff" }}>
                Admin ID
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#003366", color: "#fff" }}>
                Permission ID
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#003366", color: "#fff" }}>
                Assigned At
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{perm.admin_id}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{perm.permission_id}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{perm.assigned_at}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={fetchAdminPermissions}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1677ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔄 Оновити список
        </button>
      </section>

      <hr style={{ margin: "30px 0" }} />

      <section>
        <h2>✅ Призначити нове право</h2>
        <form onSubmit={handleCreatePermission}>
          <div style={{ marginBottom: "10px" }}>
            <label>Admin ID: </label>
            <input
              type="number"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Permission ID: </label>
            <input
              type="number"
              value={permissionId}
              onChange={(e) => setPermissionId(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ➕ Призначити
          </button>
        </form>
      </section>

      <hr style={{ margin: "30px 0" }} />

      <section>
        <h2>🗑️ Видалити призначене право</h2>
        <form onSubmit={handleDeletePermission}>
          <div style={{ marginBottom: "10px" }}>
            <label>Admin ID: </label>
            <input
              type="number"
              value={deleteAdminId}
              onChange={(e) => setDeleteAdminId(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Permission ID: </label>
            <input
              type="number"
              value={deletePermissionId}
              onChange={(e) => setDeletePermissionId(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🗑️ Видалити
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminPermissionsPage;
