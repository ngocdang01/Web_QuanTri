import React, { useState, useEffect } from 'react';
import { orderAPI } from '../config/api';
import '../styles/Order.css'; 


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAllOrders();

      let cleanedOrders = [];
      if (Array.isArray(data)) {
        const uniqueOrders = data.filter(
          (order, index, self) =>
            index === self.findIndex(o => o._id === order._id)
        );

        cleanedOrders = uniqueOrders.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      setOrders(cleanedOrders);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-container">
      <h2>Quản lý đơn hàng</h2>
      <table className="order-table">
        <thead>
          <tr>
            <th></th>
            <th>ID người dùng</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Phí ship</th>
            <th>Giảm giá</th>
            <th>Tổng</th>
            <th>Địa chỉ</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
          </tr>
        </thead>
        <tbody>
            { orders.map(order => {
               const item = order.items?.[0] || {};
              return ( 
                <tr key={order._id}>
                  <td><button className="btn btn-detail">Chi tiết</button></td>
                  <td>{order.userId?._id?.slice(-6) || "N/A"}</td>
                  <td>{item.name || '...'}</td>
                  <td>{item.purchaseQuantity || 0}</td>
                  <td>{item.price?.toLocaleString("vi-VN") || 0} VNĐ</td>
                  <td>{order.shippingFee?.toLocaleString("vi-VN") || 0}</td>
                  <td>{order.voucher?.discountAmount || 0}</td>
                  <td>{order.finalTotal?.toLocaleString("vi-VN") || 0} VNĐ</td>
                  <td>{order.shippingAddress}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Order;