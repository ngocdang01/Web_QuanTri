import React, { useEffect, useState, useRef } from "react";
import { bannerAPI } from "../config/api";
import "../styles/banner.css";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ name: "", banner: "", isActive: true });
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const fetchBanners = async () => {
    try {
      const data = await bannerAPI.getAllBanners();
      const validBanners = (data || []).filter(
        (b) => b && b._id && isValidObjectId(b._id)
      );
      setBanners(validBanners);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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
        alert(data.message || "Upload ảnh thất bại");
        return;
      }
      setForm((prev) => ({ ...prev, banner: data.url.trim() }));
      alert("Tải ảnh thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi upload ảnh!");
    }
    e.target.value = null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isDuplicate = () => {
    return banners.some((b) => {
      if (editingId && b._id === editingId) return false;
      return (
        b.name.trim().toLowerCase() === form.name.trim().toLowerCase() ||
        b.banner.trim() === form.banner.trim()
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.banner.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (isDuplicate()) {
      alert("Tên hoặc ảnh banner đã tồn tại!");
      return;
    }

    try {
      if (editingId) {
        await bannerAPI.updateBanner(editingId, form);
        alert("Cập nhật thành công!");
      } else {
        await bannerAPI.createBanner(form);
        alert("Thêm banner thành công!");
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xử lý banner!");
    }
  };

  const handleEdit = (banner) => {
    setForm({
      name: banner.name,
      banner: banner.banner,
      isActive: banner.isActive,
    });
    setEditingId(banner._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await bannerAPI.deleteBanner(id);
      fetchBanners();
    } catch (err) {
      alert("Lỗi khi xóa banner!");
    }
  };

  const handleToggle = async (id) => {
    try {
      await bannerAPI.toggleBannerStatus(id);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  const resetForm = () => {
    setForm({ name: "", banner: "", isActive: true });
    setEditingId(null);
  };

  return (
    <div className="banner-page">
      <div className="banner-container">
        <h2 className="title">Quản lý Banner</h2>

        {/* --- FORM NHẬP LIỆU --- */}
        <div className="card form-card">
          <form onSubmit={handleSubmit} className="form-layout">
            <div className="form-group">
              <label>Tên Banner</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên banner..."
                required
              />
            </div>

            <div className="form-group">
              <label>Link Ảnh</label>
              <div className="input-with-btn">
                <input
                  name="banner"
                  value={form.banner}
                  onChange={handleChange}
                  placeholder="Link ảnh hoặc chọn từ máy..."
                  required
                />
                <button
                  type="button"
                  className="btn-upload-icon"
                  onClick={() => fileInputRef.current.click()}
                  title="Chọn ảnh từ máy"
                >
                  📂
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleSelectImageFromPC}
                />
              </div>
            </div>

            {/* ⭐ DÒNG CHỨA CẢ TOGGLE VÀ NÚT BẤM ⭐ */}
            <div className="form-footer">
              {/* Bên trái: Toggle */}
              <div className="toggle-wrapper">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">{form.isActive ? "Hiển thị" : "Ẩn"}</span>
              </div>

              {/* Bên phải: Nút bấm */}
              <div className="button-group">
                {editingId && (
                  <button type="button" className="btn btn-cancel" onClick={resetForm}>
                    Hủy
                  </button>
                )}
                <button type="submit" className="btn btn-save">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
            
          </form>
        </div>

        {/* --- DANH SÁCH BANNER --- */}
        <div className="card table-card">
          {banners.length === 0 ? (
            <p className="empty-text">Chưa có banner nào.</p>
          ) : (
            <table className="banner-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên Banner</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="img-wrapper">
                        <img src={b.banner} alt={b.name} />
                      </div>
                    </td>
                    <td className="name-cell">{b.name}</td>
                    <td>
                      <label className="toggle-switch small">
                        <input
                          type="checkbox"
                          checked={b.isActive}
                          onChange={() => handleToggle(b._id)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon edit" onClick={() => handleEdit(b)} title="Sửa">✏️</button>
                        <button className="btn-icon delete" onClick={() => handleDelete(b._id)} title="Xóa">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;