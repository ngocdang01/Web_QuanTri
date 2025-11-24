import React, { useState, useEffect, useRef } from "react";
import { categoryAPI } from "../config/api";
import "../styles/Product.css";

const AdminCategories = () => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    image: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(5);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories
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

  // Reset form khi bấm Thêm
  const openAddForm = () => {
    setNewCategory({
      name: "",
      code: "",
      image: "",
    });
    setEditingCategory(null);
    setShowAddForm(true);
  };

  // check trùng
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

  // Upload ảnh
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

    const uploadedUrl = data.url.trim();

    setNewCategory((prev) => ({
      ...prev,
      image: uploadedUrl,
    }));
  } catch (err) {
    console.error("Upload error:", err);
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
      setNewCategory({
        name: "",
        code: "",
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

  // Xem chi tiết danh mục
  const handleShowDetail = async (id) => {
    setShowDetail(true);
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      const res = await categoryAPI.getCategoryById(id);
      setSelectedCategory(res.data || res);
    } catch (err) {
      setErrorDetail("Không xem được chi tiết danh mục");
      setSelectedCategory(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name || "",
      code: category.code || "",
      image: category.image || "",
    });
    setShowEditForm(true);
  };
  // check trùng update
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

  // Handle update submit
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
      alert("Vui lòng nhập link hình ảnh danh mục!");
      return;
    }
    if (!validateUpdate()) return;
    try {
      await categoryAPI.updateCategory(editingCategory._id, newCategory);

      // ✅ Gọi lại API để load lại danh sách danh mục
      await fetchCategories();

      setShowEditForm(false);
      setEditingCategory(null);
      setNewCategory({
        name: "",
        code: "",
        image: "",
      });
      alert("Cập nhật danh mục thành công!");
    } catch (err) {
      alert(
        "Không thể cập nhật danh mục: " + (err.message || "Lỗi không xác định")
      );
      console.error("Error updating category:", err);
    }
  };
  // Format date function
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

  // Add pagination calculations
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice( indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý danh mục</h2>
        <button className="btn btn-add" onClick={openAddForm}>
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
              <label>Hình ảnh:</label>
              <input
                type="url"
                name="image"
                value={newCategory.image}
                onChange={handleInputChange}
                placeholder="Dán link hoặc chọn ảnh"
                required
              />

              { /*  Nút chọn ảnh từ máy */}
              <button
                type="button"
                className="btn btn-add-image"
                onClick={() => fileInputRef.current.click()}
                style={{ marginTop: "8px" }}
              >
                📁 Chọn ảnh từ máy
              </button>

              {/* Input file ẩn */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSelectImageFromPC}
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
              <label>Hình ảnh:</label>
              <input
                type="url"
                name="image"
                value={newCategory.image}
                onChange={handleInputChange}
                required
              />

              <button
                type="button"
                className="btn btn-add-image"
                onClick={() => fileInputRef.current.click()}
                style={{ marginTop: "8px" }}
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
              <button type="submit" className="btn btn-submit">
                Cập nhật
              </button>
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

      {/* Modal chi tiết danh mục */}
      {showDetail && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowDetail(false)}
          ></div>
          <div className="form-content">
            {loadingDetail ? (
              <div className="loading">Đang tải chi tiết...</div>
            ) : errorDetail ? (
              <div className="error">{errorDetail}</div>
            ) : selectedCategory ? (
              <>
                <h3>Chi tiết danh mục</h3>
                <div className="product-images">
                  <img
                    src={
                      selectedCategory.image ||
                      "https://via.placeholder.com/120x120?text=No+Image"
                    }
                    alt={`${selectedCategory.name || "Category"}`}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      borderRadius: 8,
                      margin: "0.5rem",
                      background: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <p>
                  <b>Tên:</b> {selectedCategory.name || "Không có tên"}
                </p>
                <p>
                  <b>Mã:</b> {selectedCategory.code || "N/A"}
                </p>
                <p>
                  <b>Ngày tạo:</b> {formatDate(selectedCategory.createdAt)}
                </p>
                <p>
                  <b>Ngày cập nhật:</b> {formatDate(selectedCategory.updatedAt)}
                </p>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowDetail(false)}
                >
                  Đóng
                </button>
              </>
            ) : null}
          </div>
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
            {currentCategories.map((category) => (
              <tr key={category._id}
                onClick={() => handleShowDetail(category._id)}
                style={{ cursor: "pointer"}}
              >
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(category);
                        }}
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
            className={`btn btn-pagination ${currentPage === index + 1 ? "active" : ""
              }`}
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

export default AdminCategories;
