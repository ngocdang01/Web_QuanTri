import React, { useState, useEffect } from "react";
import { productAPI } from "../config/api";
import "../styles/Product.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAllProducts();
      if (res.success) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-container">
      <h2>Quản lý sản phẩm</h2>
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Hình ảnh</th>
              <th>Tồn kho</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString("vi-VN")} VNĐ</td>
                <td>
                  {
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="product-image"
                    />
                  }
                </td>
                <td>{product.stock}</td>
                <td className="description-cell">{product.description}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => {
                        /* TODO: Implement edit */
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => {
                        /* TODO: Implement edit */
                      }}
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
    </div>
  );
};

export default Product;
