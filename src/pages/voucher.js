import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Voucher.css";

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

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

    const openAddForm = () => {
      setNewVoucher(emptyForm);
      setShowAddForm(true);
    };
  
    const handleInputChange = (e) => {
      setNewVoucher((prev) => ({ ...prev, [e.target.name] : e.target.value }));
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
  
        const res = await axios.post("http://localhost:3002/api/vouchers/add", data);
        setVouchers([...vouchers, res.data.data]);
        setShowAddForm(false);
    };

    // Handle edit button click
    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        setNewVoucher({
            ...voucher,
            startDate: voucher.startDate.split("T")[0],
            expireDate: voucher.expireDate.split("T")[0],
        });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    // Handle update submit
    const handleUpdate = async (e) => {
        e.preventDefault();
        const data = {
          ...newVoucher,
          discount: Number(newVoucher.discount),
          minOrderAmount: Number(newVoucher.minOrderAmount),
        };

        const res = await axios.put(
          `http://localhost:3002/api/vouchers/${editingVoucher.code}`,
          data
        );

        setVouchers(vouchers.map(v => v.code === editingVoucher.code ? res.data.data : v ));
        setShowEditForm(false);
    };

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
          {vouchers.map((v) => (
            <tr key={v.code}>
              <td>{v.code}</td>
              <td>{v.label}</td>
              <td>Miễn phí ship</td>
              <td>{v.discount}đ</td>
              <td>{v.minOrderAmount}đ</td>
              <td>{new Date(v.startDate).toLocaleDateString("vi-VN")}</td>
              <td>{new Date(v.expireDate).toLocaleDateString("vi-VN")}</td>

              <td>
                {(() => {
                  const today = new Date();
                  const start = new Date(v.startDate);
                  const end = new Date(v.expireDate);

                  if (today < start)
                    return (
                      <span className="status inactive">Chưa bắt đầu</span>
                    );

                  if (today > end)
                    return <span className="status expired">Hết hạn</span>;

                  return <span className="status active">Đang hoạt động</span>;
                })()}
              </td>
              <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(v)}
                  >
                    Sửa
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {showAddForm && (
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowAddForm(false)} />

          <form className="form-content" onSubmit={handleSubmit}>
            <h3>Thêm voucher</h3>

            <div className="form-group">
              <label>Mã voucher</label>
              <input name="code" value={newVoucher.code} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Tên voucher</label>
              <input name="label" value={newVoucher.label} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea name="description" value={newVoucher.description} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Giảm phí ship</label>
              <input type="number" name="discount" value={newVoucher.discount} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Đơn tối thiểu</label>
              <input type="number" name="minOrderAmount" value={newVoucher.minOrderAmount} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Giới hạn mỗi user</label>
              <input  type="number" name="usageLimitPerUser" value={newVoucher.usageLimitPerUser} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Tổng số lượt voucher</label>
              <input type="number" name="totalUsageLimit" value={newVoucher.totalUsageLimit} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" name="startDate" value={newVoucher.startDate || ""} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" name="expireDate" min={newVoucher.startDate} // không cho nhập ngày sai hoặc trước ngày bắt đầu
                onChange={handleInputChange}
              />
            </div>
            <div className="form-buttons">
              <button className="btn btn-submit">Lưu</button>
              <button type="button" className="btn btn-cancel"
                onClick={() => setShowAddForm(false)} > Hủy </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="add-voucher-form">
          <div className="form-overlay" onClick={() => setShowEditForm(false)} />
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
                onChange={handleInputChange}
                required
              />
            </div>
                <div className="form-buttons">
                    <button type="submit" className="btn btn-submit">Cập nhật</button>
                    <button type="button" className="btn btn-cancel" onClick={() => setShowEditForm(false)}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
            )}
    </div>

  );
};

export default Voucher;
