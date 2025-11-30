import React from "react";
import "../styles/SaleProduct.css";

const SaleProducts = () => {
  return (
    <div className="sale-products-container">

      {/* HEADER */}
      <div className="sale-products-header">
        <h2>Quản lý sản phẩm giảm giá</h2>
        <button className="add-product-btn btn-action">
          Thêm sản phẩm
        </button>
      </div>

      {/* TABLE */}
      <div className="sale-products-table-wrapper">
        <table className="sale-products-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá gốc</th>
              <th>Giá giảm</th>
              <th>% Giảm</th>
              <th>Tồn kho</th>
              <th>Đã bán</th>
              <th>Kích thước</th>
              <th>Màu sắc</th>
              <th>Danh mục</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {/* Hàng mẫu (UI tĩnh) */}
            <tr>
              <td>
                <img
                  className="table-product-img"
                  src="https://via.placeholder.com/60"
                  alt="Ảnh sản phẩm"
                />
              </td>
              <td>Sản phẩm mẫu</td>
              <td>500.000</td>
              <td>350.000</td>
              <td>-30%</td>
              <td>100</td>
              <td>20</td>
              <td>S(10), M(10)</td>
              <td>Đen, Trắng</td>
              <td>DM01</td>
              <td className="action-cell">
                <div className="action-group">
                  <button className="btn btn-edit">Sửa</button>
                  <button className="btn btn-delete">Xóa</button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SaleProducts;
