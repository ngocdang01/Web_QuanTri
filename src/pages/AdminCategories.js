import React, { useState, useEffect } from "react";
import { categoryAPI } from "../config/api";
import "../styles/Product.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách danh mục");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-container">
      <h2>Danh sách danh mục</h2>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mã danh mục</th>
              <th>Hình ảnh</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>
                  {category._id
                    ? `${category._id.slice(0, 1)}...${category._id.slice(-4)}`
                    : ""}
                </td>
                <td>{category.name || "Không có tên"}</td>
                <td>{category.code || "N/A"}</td>
                <td>
                  <img
                    src={
                      category.image ||
                      "https://via.placeholder.com/60x60?text=No+Image"
                    }
                    alt={category.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    }}
                  />
                </td>
                <td>{formatDate(category.createdAt)}</td>
                <td>{formatDate(category.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
