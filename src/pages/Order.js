import React, { useState, useEffect } from 'react';
import { orderAPI } from '../config/api';
import '../styles/Order.css'; 


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOrder, setModalOrder] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);

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

  // Add pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            { currentOrders.map(order => {
               const item = order.items?.[0] || {};
              return ( 
                <tr key={order._id}>
                  <td>
                    <button className="btn btn-detail" onClick={() => setModalOrder(order)}>
                      Chi tiết
                    </button>
                  </td>
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
      <div className="pagination">
          <div className="pagination">
            <button
              className="btn btn-pagination prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>

            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`btn btn-pagination ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              className="btn btn-pagination next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>

      </div>

      {/* Modal dialog for order detail */}
      {modalOrder && (
        <div className="order-modal-overlay" onClick={() => setModalOrder(null)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <button className="order-modal-close" onClick={() => setModalOrder(null)}>&times;</button>
            <div className="order-detail-box left-align">
              <div><b>Mã đơn hàng:</b> {modalOrder._id || 'N/A'}</div>
              <div><b>Mã code:</b> {modalOrder.order_code || 'N/A'}</div>
              {modalOrder.userId && typeof modalOrder.userId === 'object' && (
                <>
                  <div><b>Tên người dùng:</b> {modalOrder.userId.name || ''}</div>
                  <div><b>Email:</b> {modalOrder.userId.email || ''}</div>
                </>
              )}
              <div><b>Địa chỉ:</b> {modalOrder.shippingAddress || 'Không có địa chỉ'}</div>
              <div><b>Thông tin sản phẩm:</b></div>
              {modalOrder.items && modalOrder.items.map((item, idx) => (
                <div key={item.productId || idx} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                  • {item.name || 'Không có tên'} 
                  (SL: {item.purchaseQuantity || 0}, 
                  Size: {item.size || 'N/A'}, 
                  Màu: {item.color || 'N/A'},
                  Giá: {item.price ? item.price.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'})
                </div>
              ))}
              {modalOrder.voucher && (
                <div><b>Mã giảm giá:</b> {modalOrder.voucher.code || 'N/A'} (Giảm: {modalOrder.voucher.discountAmount?.toLocaleString('vi-VN') || '0'} VNĐ)</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;