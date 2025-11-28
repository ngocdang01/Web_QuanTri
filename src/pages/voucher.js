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
    usageLimitPerUser: "",
    totalUsageLimit: "",
    startDate: "",
    expireDate: "",
    status: "active",
    type: "shipping",
  };

  const [newVoucher, setNewVoucher] = useState(emptyForm);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await axios.get("http://localhost:3002/api/vouchers");
      setVouchers(res.data.data || []);
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

    const data = {
      code: newVoucher.code.toUpperCase(),
      label: newVoucher.label,
      description: newVoucher.description,
      discount: Number(newVoucher.discount),
      minOrderAmount: Number(newVoucher.minOrderAmount),
      usageLimitPerUser: Number(newVoucher.usageLimitPerUser),
      totalUsageLimit: Number(newVoucher.totalUsageLimit),
      startDate: newVoucher.startDate,
      expireDate: newVoucher.expireDate,
      status: newVoucher.status,
      type: "shipping",
      createdBy: "admin",
      isGlobal: false,
    };

    console.log("📌 Data gửi lên BE:", data); // kiểm tra data FE gửi

    try {
      const res = await axios.post(
        "http://localhost:3002/api/vouchers/add",
        data
      );
      setVouchers([...vouchers, res.data.data]);
      setShowAddForm(false);
    } catch (err) {
      console.log("❌ Lỗi từ backend:", err.response?.data);
      alert(err.response?.data?.message || "Không thể thêm voucher");
    }
  };
  // Handle edit button click
  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);

    setNewVoucher({
      ...voucher,
      startDate: voucher.startDate.split("T")[0],
      expireDate: voucher.expireDate.split("T")[0],
    });

    setShowAddForm(false);
    setShowDetail(false);
    setShowEditForm(true);
  };
  // Handle update submit
  const handleUpdate = async (e) => {
    e.preventDefault();

    const data = {
      ...newVoucher,
      discount: Number(newVoucher.discount),
      minOrderAmount: Number(newVoucher.minOrderAmount),
      usageLimitPerUser: Number(newVoucher.usageLimitPerUser),
      totalUsageLimit: Number(newVoucher.totalUsageLimit),
      startDate: new Date(newVoucher.startDate),
      expireDate: new Date(newVoucher.expireDate),
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
    } catch {
      alert("Không thể cập nhật");
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher không?")) return;

    try {
      await axios.delete(`http://localhost:3002/api/vouchers/${code}`);
      setVouchers(vouchers.filter((v) => v.code !== code));
    } catch {
      alert("Không thể xóa voucher");
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

      {/* table */}
      <div className="table-responsive">
        <table className="voucher-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên voucher</th>
              <th>Loại</th>
              <th>Giảm phí</th>
              <th>Tối thiểu</th>
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
                  style={{ cursor: "pointer" }}
                >
                  {v.code}
                </td>
                <td>{v.label}</td>
                <td>Miễn phí ship</td>
                <td>{v.discount.toLocaleString("vi-VN")}đ</td>
                <td>{v.minOrderAmount.toLocaleString("vi-VN")}đ</td>
                <td>{new Date(v.startDate).toLocaleDateString("vi-VN")}</td>
                <td>{new Date(v.expireDate).toLocaleDateString("vi-VN")}</td>

                <td>
                  {(() => {
                    const today = new Date();
                    const start = new Date(v.startDate);
                    const end = new Date(v.expireDate);

                    let display = "";
                    let cssClass = "";

                    if (today < start) {
                      display = "Chưa bắt đầu";
                      cssClass = "inactive"; // màu xám
                    } else if (today > end) {
                      display = "Hết hạn";
                      cssClass = "expired"; // màu đỏ
                    } else {
                      display = "Đang hoạt động";
                      cssClass = "active"; // màu xanh
                    }

                    return (
                      <span className={`status ${cssClass}`}>{display}</span>
                    );
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
          </tbody>
        </table>
      </div>

      {/* ====================== PAGINATION ====================== */}
      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-pagination ${
              currentPage === i + 1 ? "active" : ""
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowAddForm(false)} />

          <form className="form-content" onSubmit={handleSubmit}>
            <h3>Thêm voucher</h3>

            <div className="form-group">
              <label>Mã voucher</label>
              <input
                name="code"
                value={newVoucher.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tên voucher</label>
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

            <div className="form-group">
              <label>Giảm phí ship</label>
              <input
                type="number"
                name="discount"
                value={newVoucher.discount}
                onChange={handleInputChange}
                required
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
              />
            </div>

            <div className="form-group">
              <label>Giới hạn mỗi user</label>
              <input
                type="number"
                name="usageLimitPerUser"
                value={newVoucher.usageLimitPerUser}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tổng số lượt voucher</label>
              <input
                type="number"
                name="totalUsageLimit"
                value={newVoucher.totalUsageLimit}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={newVoucher.startDate || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                name="expireDate"
                value={newVoucher.expireDate || ""}
                min={newVoucher.startDate} // không cho nhập ngày sai hoặc trước ngày bắt đầu
                onChange={handleInputChange}
              />
            </div>
            <div className="form-buttons">
              <button className="btn btn-submit">Lưu</button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                {" "}
                Hủy{" "}
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="add-voucher-form">
          <div
            className="form-overlay"
            onClick={() => setShowEditForm(false)}
          />
          <form className="form-content" onSubmit={handleUpdate}>
            <h3>Sửa voucher</h3>
            
            <div className="form-group">
              <label>Mã voucher</label>
              <input
                name="code"
                value={newVoucher.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nhãn</label>
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

            <div className="form-group">
              <label>Giảm phí ship</label>
              <input
                type="number"
                name="discount"
                value={newVoucher.discount}
                onChange={handleInputChange}
                required
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
              />
            </div>

            <div className="form-group">
              <label>Giới hạn mỗi user</label>
              <input
                type="number"
                name="usageLimitPerUser"
                value={newVoucher.usageLimitPerUser}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tổng số lượt voucher</label>
              <input
                type="number"
                name="totalUsageLimit"
                value={newVoucher.totalUsageLimit}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={newVoucher.startDate || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                name="expireDate"
                value={newVoucher.expireDate || ""} 
                min={newVoucher.ẽ} // không cho nhập ngày sai hoặc trước ngày bắt đầu
                onChange={handleInputChange}
              />
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

            <p>
              <b>Mã:</b> {selectedVoucher.code}
            </p>
            <p>
              <b>Nhãn:</b> {selectedVoucher.label}
            </p>
            <p>
              <b>Mô tả:</b> {selectedVoucher.description}
            </p>
            <p>
              <b>Giảm phí:</b>{" "}
              {selectedVoucher.discount.toLocaleString("vi-VN")} đ
            </p>
            <p>
              <b>Đơn tối thiểu:</b>{" "}
              {selectedVoucher.minOrderAmount.toLocaleString("vi-VN")} đ
            </p>
            <p>
              <b>Giới hạn mỗi user:</b> {selectedVoucher.usageLimitPerUser}
            </p>
            <p>
              <b>Tổng lượt:</b> {selectedVoucher.totalUsageLimit}
            </p>
            <p>
              <b>Ngày bắt đầu:</b>{" "}
              {new Date(selectedVoucher.startDate).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <b>Ngày kết thúc:</b>{" "}
              {new Date(selectedVoucher.expireDate).toLocaleDateString("vi-VN")}
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

export default Voucher;
