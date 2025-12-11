import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Voucher.css";

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [editingVoucher, setEditingVoucher] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 5;

  const emptyForm = {
    code: "",
    label: "",
    description: "",
    discount: "",
    minOrderAmount: "",
    startDate: "",
    expireDate: "",
    status: "active",
  };

  const [newVoucher, setNewVoucher] = useState(emptyForm);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await axios.get("http://localhost:3002/api/vouchers");
      setVouchers(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoucher((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setNewVoucher(emptyForm);
    setShowEditForm(false);
    setShowDetail(false);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discountVal = Number(newVoucher.discount);
    const minOrderVal = Number(newVoucher.minOrderAmount);

    if (discountVal < 0 || minOrderVal < 0) {
      alert("Lỗi: Giảm giá và Đơn tối thiểu không được là số âm!");
      return;
    }

    const data = {
      code: newVoucher.code.toUpperCase(),
      label: newVoucher.label,
      description: newVoucher.description,
      discount: discountVal,
      minOrderAmount: minOrderVal,
      startDate: newVoucher.startDate,
      expireDate: newVoucher.expireDate,
      status: newVoucher.status,
    };

    try {
      const res = await axios.post(
        "http://localhost:3002/api/vouchers/add",
        data
      );
      setVouchers([res.data.data, ...vouchers]);
      setShowAddForm(false);
      alert("Tạo voucher thành công!");
    } catch (err) {
      console.error("Lỗi thêm mới:", err);
      const msg = err.response?.data?.message || "Không thể thêm voucher";
      alert(`Thất bại: ${msg}`);
    }
  };
  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split("T")[0];
    };

    setNewVoucher({
      ...voucher,
      startDate: formatDate(voucher.startDate),
      expireDate: formatDate(voucher.expireDate),
    });

    setShowAddForm(false);
    setShowDetail(false);
    setShowEditForm(true);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingVoucher || !editingVoucher.code) {
      alert("Lỗi hệ thống: Không tìm thấy mã voucher!");
      return;
    }

    // Validate số âm logic
    const discountVal = Number(newVoucher.discount);
    const minOrderVal = Number(newVoucher.minOrderAmount);

    if (discountVal < 0 || minOrderVal < 0) {
      alert("Lỗi: Giá trị tiền không được nhỏ hơn 0!");
      return;
    }

    const data = {
      label: newVoucher.label,
      description: newVoucher.description,
      discount: discountVal,
      minOrderAmount: minOrderVal,
      startDate: newVoucher.startDate,
      expireDate: newVoucher.expireDate,
      status: newVoucher.status,
    };

    try {
      const res = await axios.put(
        `http://localhost:3002/api/vouchers/${editingVoucher.code}`,
        data
      );

      setVouchers(
        vouchers.map((v) =>
          v.code === editingVoucher.code ? res.data.data : v
        )
      );
      setShowEditForm(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      const msg = err.response?.data?.message || err.message || "Lỗi server";
      alert(`Không thể cập nhật: ${msg}`);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này không?")) return;

    try {
      await axios.delete(`http://localhost:3002/api/vouchers/${encodeURIComponent(code)}`);
      setVouchers(vouchers.filter((v) => v.code !== code));
      alert("Đã xóa voucher.");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa voucher");
    }
  };

  const handleShowDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setShowAddForm(false);
    setShowEditForm(false);
    setShowDetail(true);
  };

  // Paginantion
  const indexLast = currentPage * vouchersPerPage;
  const indexFirst = indexLast - vouchersPerPage;
  const current = vouchers.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(vouchers.length / vouchersPerPage);

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="voucher-container">
      <div className="voucher-header">
        <h2>Quản lý voucher</h2>
        <button className="btn btn-add" onClick={openAddForm}>
          Thêm
        </button>
      </div>
      <div className="table-responsive">
        <table className="voucher-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên voucher</th>
              <th>Giảm phí</th>
              <th>Đơn tối thiểu</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {current.map((v) => (
              <tr key={v.code}>
                <td
                  onClick={() => handleShowDetail(v)}
                  style={{ cursor: "pointer", fontWeight: "bold", color: "#00DD00" }}
                >
                  {v.code}
                </td>
                <td>{v.label}</td>
                <td>{v.discount?.toLocaleString("vi-VN")}đ</td>
                <td>{v.minOrderAmount?.toLocaleString("vi-VN")}đ</td>
                <td>{new Date(v.startDate).toLocaleDateString("vi-VN")}</td>
                <td>{new Date(v.expireDate).toLocaleDateString("vi-VN")}</td>

                <td>
                  {(() => {
                    if (v.status === "inactive") return <span className="status inactive">Đã khóa</span>;

                    const today = new Date();
                    const start = new Date(v.startDate);
                    const end = new Date(v.expireDate);

                    if (today < start) {
                      return <span className="status inactive">Chưa bắt đầu</span>;
                    } else if (today > end) {
                      return <span className="status expired">Hết hạn</span>;
                    } else {
                      return <span className="status active">Đang hoạt động</span>;
                    }
                  })()}
                </td>
                <td>
                  <button 
                    className="btn btn-edit" 
                    onClick={() => handleEdit(v)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-delete" 
                    onClick={() => handleDelete(v.code)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {current.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>Chưa có voucher nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-pagination ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {showAddForm && (
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowAddForm(false)} />

          <form className="form-content" onSubmit={handleSubmit}>
            <h3>Thêm voucher mới</h3>

            <div className="form-group">
              <label>Mã voucher (CODE)</label>
              <input
                name="code"
                value={newVoucher.code}
                onChange={handleInputChange}
                required
                placeholder="VD: FREE50K"
              />
            </div>

            <div className="form-group">
              <label>Tên hiển thị</label>
              <input
                name="label"
                value={newVoucher.label}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={newVoucher.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giảm phí ship (VNĐ)</label>
                <input
                  type="number"
                  name="discount"
                  value={newVoucher.discount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={newVoucher.minOrderAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  value={newVoucher.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input
                  type="date"
                  name="expireDate"
                  value={newVoucher.expireDate}
                  min={newVoucher.startDate} // Ngày kết thúc phải sau ngày bắt đầu
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select name="status" value={newVoucher.status} onChange={handleInputChange}>
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Vô hiệu hóa (Inactive)</option>
              </select>
            </div>
            <div className="form-buttons">
              <button className="btn btn-submit">Lưu Voucher</button>
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
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowEditForm(false)} />
          <form className="form-content" onSubmit={handleUpdate}>
            <h3>Sửa voucher: {newVoucher.code}</h3>
            <div className="form-group">
              <label>Mã voucher</label>
              <input
                name="code"
                value={newVoucher.code}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Tên hiển thị</label>
              <input
                name="label"
                value={newVoucher.label}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={newVoucher.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giảm phí ship</label>
                <input
                  type="number"
                  name="discount"
                  value={newVoucher.discount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Đơn tối thiểu</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={newVoucher.minOrderAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  value={newVoucher.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input
                  type="date"
                  name="expireDate"
                  value={newVoucher.expireDate}
                  min={newVoucher.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select name="status" value={newVoucher.status} onChange={handleInputChange}>
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Vô hiệu hóa (Inactive)</option>
              </select>
            </div>

            <div className="form-buttons">
              <button className="btn btn-submit">
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
      {showDetail && selectedVoucher && (
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowDetail(false)} />

          <div className="form-content">
            <h3>Chi tiết voucher</h3>
            <p><b>Mã:</b> {selectedVoucher.code}</p>
            <p><b>Nhãn:</b> {selectedVoucher.label}</p>
            <p><b>Mô tả:</b> {selectedVoucher.description}</p>
            <p><b>Loại:</b> Vận chuyển (Shipping)</p>
            <p><b>Giảm phí:</b> {selectedVoucher.discount?.toLocaleString("vi-VN")} đ</p>
            <p><b>Đơn tối thiểu:</b> {selectedVoucher.minOrderAmount?.toLocaleString("vi-VN")} đ</p>
            <p><b>Ngày bắt đầu:</b> {new Date(selectedVoucher.startDate).toLocaleDateString("vi-VN")}</p>
            <p><b>Ngày kết thúc:</b> {new Date(selectedVoucher.expireDate).toLocaleDateString("vi-VN")}</p>
            <p><b>Trạng thái:</b> {selectedVoucher.status === "active" ? "Hoạt động" : "Đã khóa"}</p>

            <button className="btn btn-cancel" onClick={() => setShowDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voucher;