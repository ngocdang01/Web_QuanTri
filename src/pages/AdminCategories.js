import React, { useState, useEffect, useRef } from "react";
import { categoryAPI } from "../config/api";
import "../styles/Product.css";

const AdminCategories = () => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    image: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Load categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };
  const openAddForm = () => {
    setNewCategory({ 
      name: "", 
      code: "", 
      image: "" ,
    });
    setShowAddForm(true);
  };
  // Check trùng khi tạo
  const validateCreate = () => {
    const name = newCategory.name.trim().toLowerCase();
    const code = newCategory.code.trim().toLowerCase();
    const image = newCategory.image.trim();

    const duplicateName = categories.some(
      (c) => c.name.trim().toLowerCase() === name
    );
    if (duplicateName) {
      alert("Tên danh mục đã tồn tại!");
      return false;
    }
    const duplicateCode = categories.some(
      (c) => c.code.trim().toLowerCase() === code
    );
    if (duplicateCode) {
      alert("Mã danh mục đã tồn tại!");
      return false;
    }

    const duplicateImage = categories.some(
      (c) => c.image.trim() === image
    );
    if (duplicateImage) {
      alert("Hình ảnh danh mục đã tồn tại!");
      return false;
    }
    return true;
  };

  const handleSelectImageFromPC = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("http://localhost:3002/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Upload ảnh thất bại!");
      return;
    }

      setNewCategory((prev) => ({ ...prev, image: data.url }));
    } catch {
      alert("Lỗi upload ảnh!");
    }

    e.target.value = null;
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

    if (!validateCreate()) return;

    try {
      await categoryAPI.createCategory(newCategory);
      fetchCategories();
      setShowAddForm(false);
      alert("Thêm danh mục thành công!");
    } catch (err) {
      alert("Không thể thêm danh mục!");
    }
  };


  // ======================
  // UPDATE CATEGORY
  // ======================
  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      code: category.code,
      image: category.image,
    });
    setShowEditForm(true);
  };

  // Check trùng khi cập nhật
    const validateUpdate = () => {
      const name = newCategory.name.trim().toLowerCase();
      const code = newCategory.code.trim().toLowerCase();
      const image = newCategory.image.trim();

      const duplicateName = categories.some(
        (c) =>
          c._id !== editingCategory._id &&
          c.name.trim().toLowerCase() === name
      );
      if (duplicateName) {
        alert("Tên danh mục đã tồn tại!");
        return false;
      }

      const duplicateCode = categories.some(
        (c) =>
          c._id !== editingCategory._id &&
          c.code.trim().toLowerCase() === code
      );
      if (duplicateCode) {
        alert("Mã danh mục đã tồn tại!");
        return false;
      }

      const duplicateImage = categories.some(
        (c) =>
          c._id !== editingCategory._id &&
          c.image.trim() === image
      );
      if (duplicateImage) {
        alert("Hình ảnh danh mục đã tồn tại!");
        return false;
      }

      return true;
    };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!newCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }
    if (!newCategory.code.trim()) {
      alert("Vui lòng nhập mã danh mục!");
      return;
    }
    if (!newCategory.image.trim()) {
      alert("Vui lòng nhập hình danh mục!");
      return;
    }

    if (!validateUpdate()) return;

    try {
      await categoryAPI.updateCategory(editingCategory._id, newCategory);
      fetchCategories();
      setShowEditForm(false);
      alert("Cập nhật danh mục thành công!");
    } catch (err) {
      alert("Không thể cập nhật danh mục!");
    }
  };


  // ======================
  // SHOW DETAIL
  // ======================
  const handleShowDetail = async (id) => {
    try {
      const res = await categoryAPI.getCategoryById(id);
      setSelectedCategory(res.data || res);
      setShowDetail(true);
    } catch (err) {
      alert("Không thể tải chi tiết danh mục!");
    }
  };

  // ======================
  // TOGGLE STATUS (ẨN / HIỆN)
  // ======================
  const handleToggleStatus = async (id) => {
    try {
      await categoryAPI.toggleCategoryStatus(id);
      fetchCategories();
    } catch (err) {
      alert("Không thể thay đổi trạng thái danh mục!");
    }
  };

  // ======================
  // FORMAT DATE
  // ======================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  // ======================
  // PAGINATION
  // ======================
  const indexLast = currentPage * categoriesPerPage;
  const indexFirst = indexLast - categoriesPerPage;
  const currentCategories = categories.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  // ======================
  // RENDER
  // ======================

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý danh mục</h2>
        <button className="btn btn-add" onClick={openAddForm}>
          Thêm
        </button>
      </div>

      {/* ADD FORM */}
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
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mã danh mục:</label>
              <input
                name="code"
                value={newCategory.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Hình ảnh:</label>
              <input
                name="image"
                value={newCategory.image}
                onChange={handleInputChange}
                placeholder="Link ảnh..."
                required
              />

              <button
                type="button"
                className="btn btn-add-image"
                onClick={() => fileInputRef.current.click()}
              >
                📁 Chọn ảnh từ máy
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSelectImageFromPC}
              />
            </div>

            <div className="form-buttons">
              <button className="btn btn-submit">Lưu</button>
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

      {/* EDIT FORM */}
      {showEditForm && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowEditForm(false)}
          ></div>

          <form onSubmit={handleUpdate} className="form-content">
            <h3>Sửa danh mục</h3>

            <div className="form-group">
              <label>Tên danh mục:</label>
              <input
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mã danh mục:</label>
              <input
                name="code"
                value={newCategory.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Hình ảnh:</label>
              <input
                name="image"
                value={newCategory.image}
                onChange={handleInputChange}
                required
              />

              <button
                type="button"
                className="btn btn-add-image"
                onClick={() => fileInputRef.current.click()}
              >
                📁 Chọn ảnh từ máy
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSelectImageFromPC}
              />
            </div>

            <div className="form-buttons">
              <button className="btn btn-submit">Cập nhật</button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowEditForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mã</th>
              <th>Hình</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {currentCategories.map((category) => (
              <tr key={category._id}
                onClick={() => handleShowDetail(category._id)}
                style={{ cursor: "pointer"}}
              >
                <td>{category._id.slice(0, 6)}...</td>
                <td>{category.name}</td>
                <td>{category.code}</td>
                <td>
                  <img
                    src={category.image}
                    alt="img"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                </td>
                <td>
                  {category.isActive ? (
                    <span className="status-active">Hiển thị</span>
                  ) : (
                    <span className="status-hidden">Đang ẩn</span>
                  )}
                </td>
                <td>{formatDate(category.createdAt)}</td>
                <td>{formatDate(category.updatedAt)}</td>
                <td
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(category)}
                  >
                    Sửa
                  </button>
                  <button
                    className={`btn ${
                      category.isActive ? "btn-disable" : "btn-enable"
                    }`}
                    onClick={() => handleToggleStatus(category._id)}
                  >
                    {category.isActive ? "Ẩn" : "Hiện"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          className="btn btn-pagination"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Trước
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`btn btn-pagination ${
              currentPage === index + 1 ? "active" : ""
            }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn btn-pagination"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
      {showDetail && selectedCategory && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowDetail(false)}
          ></div>
          <div className="form-content">
            <h3>Chi tiết danh mục</h3>
            <img
              src={selectedCategory.image}
              alt=""
              style={{
                width: 120,
                height: 120,
                borderRadius: 10,
                marginBottom: 15,
              }}
            />
            <p>
              <b>Tên:</b> {selectedCategory.name}
            </p>
            <p>
              <b>Mã:</b> {selectedCategory.code}
            </p>
            <p>
              <b>Ngày tạo:</b> {formatDate(selectedCategory.createdAt)}
            </p>
            <p>
              <b>Cập nhật:</b> {formatDate(selectedCategory.updatedAt)}
            </p>

            <button
              className="btn btn-cancel"
              onClick={() => setShowDetail(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCategories;
