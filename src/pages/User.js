import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("http://localhost:3002/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:3002/api/users/${userId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: res.data.isActive } : u
        )
      );
      alert(res.data.message);
    } catch (err) {
      alert("Không thể cập nhật trạng thái người dùng!");
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleShowDetail = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div className="error-container"><p>Lỗi: {error}</p><button onClick={() => window.location.reload()} className="btn-retry">Thử lại</button></div>;

  return (
    <div className="user-management">
      <div className="user-header">
        <h2>Quản lý người dùng</h2>
        <div className="user-stats">
          <span className="stat-item">Tổng số: <strong>{users.length}</strong></span>
          <span className="stat-item">Admin: <strong>{users.filter((user) => user.role === "admin").length}</strong></span>
          <span className="stat-item">User: <strong>{users.filter((user) => user.role === "user").length}</strong></span>
        </div>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td 
                  className="id-cell user-id-click"
                  onClick={() => handleShowDetail(user)}
                  style={{cursor: 'pointer', color: '#DC143C', fontWeight: 'bold'}}
                  title="Xem chi tiết"
                >
                    {user._id.slice(-6)}
                </td>
                <td onClick={() => handleShowDetail(user)} style={{cursor: 'pointer'}}>
                    {user.name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.role === "admin" ? (
                    <span style={{ color: "#0f766e", fontWeight: "600", fontSize: "0.9rem" }}>
                      ✔ Hoạt động
                    </span>
                  ) : (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={user.isActive}
                        onChange={() => handleToggleActive(user._id)}
                      />
                      <span className="slider"></span>
                    </label>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn btn-pagination" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
        {[...Array(totalPages)].map((_, index) => (
          <button key={index + 1} className={`btn btn-pagination ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
        ))}
        <button className="btn btn-pagination" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
      </div>
      {showDetail && selectedUser && (
        <div className="add-product-form">
          <div className="form-overlay" onClick={() => setShowDetail(false)}></div>
          <div className="form-content" style={{maxWidth: '500px'}}>
            <h3 style={{textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
              Hồ sơ người dùng
            </h3>

            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', 
                    background: selectedUser.role === 'admin' ? '#0f766e' : '#3b82f6',
                    color: '#fff', fontSize: '32px', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
            </div>

            <div className="user-detail-grid" style={{display: 'grid', gap: '15px'}}>
                <div className="detail-item">
                    <strong>ID hệ thống:</strong>
                    <span style={{color: '#666'}}>{selectedUser._id}</span>
                </div>

                <div className="detail-item">
                    <strong>Họ và tên:</strong>
                    <span style={{fontSize: '1.1em', fontWeight: '500'}}>{selectedUser.name}</span>
                </div>

                <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedUser.email}</span>
                </div>

                {/* --- HIỂN THỊ SỐ ĐIỆN THOẠI --- */}
                <div className="detail-item">
                    <strong>Số điện thoại:</strong>
                    <span style={{color: selectedUser.phone || selectedUser.phoneNumber ? '#333' : '#999', fontStyle: selectedUser.phone || selectedUser.phoneNumber ? 'normal' : 'italic'}}>
                        {selectedUser.phone || selectedUser.phoneNumber || "Chưa cập nhật"}
                    </span>
                </div>

                <div className="detail-item">
                    <strong>Vai trò:</strong>
                    <span className={`role-badge ${selectedUser.role}`} style={{display: 'inline-block'}}>
                        {selectedUser.role.toUpperCase()}
                    </span>
                </div>

                <div className="detail-item">
                    <strong>Trạng thái:</strong>
                    {selectedUser.isActive ? (
                         <span style={{color: 'green', fontWeight: 'bold'}}>● Đang hoạt động</span>
                    ) : (
                         <span style={{color: 'red', fontWeight: 'bold'}}>● Đang bị khóa</span>
                    )}
                </div>

                <div className="detail-item">
                    <strong>Ngày tham gia:</strong>
                    <span>{new Date(selectedUser.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                
                 {selectedUser.address && (
                    <div className="detail-item">
                        <strong>Địa chỉ:</strong>
                        <span>{selectedUser.address}</span>
                    </div>
                )}
            </div>

            <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end'}}>
              <button 
                className="btn btn-cancel" 
                onClick={() => setShowDetail(false)}
                style={{padding: '8px 20px'}}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;