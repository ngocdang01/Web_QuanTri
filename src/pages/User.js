import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
      try {
        // Get token from localStorage
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

  // ⭐ HÀM KHÓA / MỞ NGƯỜI DÙNG
  const handleToggleActive = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `http://localhost:3002/api/users/${userId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật lại danh sách users
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

  // Add pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>Lỗi: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="user-management">
      <div className="user-header">
        <h2>Quản lý người dùng</h2>
        <div className="user-stats">
          <span className="stat-item">Tổng số: {users.length}</span>
          <span className="stat-item">
            Admin: {users.filter((user) => user.role === "admin").length}
          </span>
          <span className="stat-item">
            User: {users.filter((user) => user.role === "user").length}
          </span>
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
                <td className="id-cell">{user._id.slice(-6)}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                {/*  Thay code để admin luôn hoạt động */}
                <td>
                  {user.role === "admin" ? (
                    <span style={{ color: "#0f766e", fontWeight: "600" }}>
                      Luôn hoạt động
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

      {/* Add pagination controls */}
      <div className="pagination">
        <button
          className="btn btn-pagination"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`btn btn-pagination ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn btn-pagination"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
              </div>
    </div>
  );
};

export default User;
