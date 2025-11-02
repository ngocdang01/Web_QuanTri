import React, { useState, useEffect } from "react";
import { categoryAPI } from "../config/api";
import "../styles/Product.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    image: "",
  });

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
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate
    if (!newCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }
    if (!newCategory.code.trim()) {
      alert("Vui lòng nhập mã danh mục!");
      return;
    }
    if (!newCategory.image.trim()) {
      alert("Vui lòng nhập link hình ảnh danh mục!");
      return;
    }

    try {
      await categoryAPI.createCategory(newCategory);
      fetchCategories();
      setShowAddForm(false);
      setNewCategory({
        name: "",
        code: "",
        type: "club",
        image: "",
      });
      alert("Thêm danh mục thành công!");
    } catch (err) {
      alert(
        "Không thể thêm danh mục: " + (err.message || "Lỗi không xác định")
      );
      console.error("Error adding category:", err);
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

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryAPI.deleteCategory(id);
        setCategories(categories.filter((c) => c._id !== id));
        alert("Xóa danh mục thành công!");
      } catch (err) {
        alert("Không thể xóa danh mục: ");
        console.error("Error deleting category:", err);
      }
    }
  };
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý danh mục</h2>
        <button className="btn btn-add" onClick={() => setShowAddForm(true)}>
          Thêm
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowAddForm(false)}
          ></div>
          <form onSubmit={handleSubmit} className="form-content">
            <h3>Thêm danh mục mới</h3>
            <div className="form-group">
              <label>Tên danh mục:</label>
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mã danh mục:</label>
              <input
                type="text"
                name="code"
                value={newCategory.code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Link hình ảnh:</label>
              <input
                type="url"
                name="image"
                value={newCategory.image}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-submit">
                Lưu
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
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
              <th>Thao tác</th>
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
                  <div className="product-image">
                    <img
                      src={
                        category.image
                          ? category.image
                          : "https://via.placeholder.com/60x60?text=No+Image"
                      }
                      alt={category.name ? category.name : "No name"}
                    />
                  </div>
                </td>
                <td>{formatDate(category.createdAt)}</td>
                <td>{formatDate(category.updatedAt)}</td>
                <td>
                  <div 
                    className="action-buttons"
                    onClick={(e) => e.stopPropagation()}
                  >
                      <button 
                        className="btn btn-edit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category._id);
                        }}
                        className="btn btn-delete"
                      >
                        Xóa
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
