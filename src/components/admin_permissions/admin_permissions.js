import React, { useState, useEffect } from 'react';

const AdminPermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [permissionId, setPermissionId] = useState('');
  const [deleteAdminId, setDeleteAdminId] = useState('');
  const [deletePermissionId, setDeletePermissionId] = useState('');

  const API_URL = 'http://192.168.0.116:5000/api';

  const fetchAdminPermissions = async () => {
    try {
      const response = await fetch(`${API_URL}/admin_permissions`);
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      alert('Permission assigned: ' + JSON.stringify(result));
      fetchAdminPermissions();
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  const handleDeletePermission = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_URL}/admin_permissions/${deleteAdminId}/${deletePermissionId}`,
        { method: 'DELETE' }
      );
      if (response.status === 204) {
        alert('Permission deleted successfully');
        fetchAdminPermissions();
      } else {
        const error = await response.json();
        alert('Error deleting permission: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  useEffect(() => {
    fetchAdminPermissions();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#4CAF50' }}>Admin Permissions</h1>
      </header>

      <section>
        <h2>All Admin Permissions</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#4CAF50', color: 'white' }}>
                Admin ID
              </th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#4CAF50', color: 'white' }}>
                Permission ID
              </th>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#4CAF50', color: 'white' }}>
                Assigned At
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{permission.admin_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{permission.permission_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{permission.assigned_at}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={fetchAdminPermissions}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          Refresh Data
        </button>
      </section>

      <section>
        <h2>Assign Permissions</h2>
        <form onSubmit={handleCreatePermission}>
          <label>
            Admin ID:
            <input
              type="number"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              style={{ marginLeft: '10px', marginBottom: '10px', padding: '5px' }}
              required
            />
          </label>
          <br />
          <label>
            Permission ID:
            <input
              type="number"
              value={permissionId}
              onChange={(e) => setPermissionId(e.target.value)}
              style={{ marginLeft: '10px', marginBottom: '10px', padding: '5px' }}
              required
            />
          </label>
          <br />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Assign Permissions
          </button>
        </form>
      </section>

      <section>
        <h2>Delete Permissions</h2>
        <form onSubmit={handleDeletePermission}>
          <label>
            Admin ID:
            <input
              type="number"
              value={deleteAdminId}
              onChange={(e) => setDeleteAdminId(e.target.value)}
              style={{ marginLeft: '10px', marginBottom: '10px', padding: '5px' }}
              required
            />
          </label>
          <br />
          <label>
            Permission ID:
            <input
              type="number"
              value={deletePermissionId}
              onChange={(e) => setDeletePermissionId(e.target.value)}
              style={{ marginLeft: '10px', marginBottom: '10px', padding: '5px' }}
              required
            />
          </label>
          <br />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Delete Permission
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminPermissionsPage;
