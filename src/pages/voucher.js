import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Voucher.css";

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="voucher-container">
      <div className="voucher-header">
        <h2>Quản lý voucher</h2>
      </div>

      <table className="voucher-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Nhãn</th>
            <th>Loại</th>
            <th>Giảm phí</th>
            <th>Tối thiểu</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Voucher;
