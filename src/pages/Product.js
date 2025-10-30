import React, { useState, useEffect } from "react";
import { productAPI } from "../config/api";
import "../styles/Product.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    sold: "",
    description: "",
    images: [""],
    size: ["M"],
    categoryCode: "",
  });
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle images change
  const handleImagesChange = (index, value) => {
    setNewProduct(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  // Add new image field
  const addImageField = () => {
    setNewProduct((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  // Remove image field
  const removeImageField = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle size change
  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    setNewProduct((prev) => {
      let newSizes = [...prev.size];
      if (checked) {
        if (!newSizes.includes(value)) {
          newSizes.push(value);
        }
      } else {
        newSizes = newSizes.filter((size) => size !== value);
      }
      return {
        ...prev,
        size: newSizes,
      };
    });
  };

  // Hanle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty image URLs
      const filteredImages = newProduct.images.filter(img => img.trim() !== '');
      
      // Chuyển đổi price và stock thành số
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        images: filteredImages
      };
      
      const response = await productAPI.createProduct(productData);
      setProducts([...products, response]);
      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        image: "",
      });
      alert("Thêm sản phẩm thành công!");
    } catch (error) {
      alert(
        "Không thể thêm sản phẩm: " + (error.message || "Lỗi không xác định")
      );
      console.error("Error adding product:", error);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productAPI.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
        alert("Xóa sản phẩm thành công!");
      } catch (err) {
        alert("Không thể xóa sản phẩm");
        console.error("Error deleting product:", err);
      }
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý sản phẩm</h2>
        <button className="btn btn-add" onClick={() => setShowAddForm(true)}>
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
            <h3>Thêm sản phẩm mới</h3>
            <div className="form-group">
              <label>Tên sản phẩm:</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Giá:</label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Số lượng:</label>
              <input
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mô tả:</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Link hình ảnh:</label>
              {newProduct.images.map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImagesChange(index, e.target.value)}
                    placeholder={`Link hinh anh ${index + 1}`}
                    required={index === 0}
                  />
                  {newProduct.images.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-remove"
                      onClick={() => removeImageField(index)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Mã danh mục:</label>
              <input
                type="text"
                name="categoryCode"
                value={newProduct.categoryCode}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Size có sẵn:</label>
              <div className="size-checkboxes">
                {["S", "M", "L"].map((size) => (
                  <label key={size} className="size-checkbox">
                    <input
                      type="checkbox"
                      value={size}
                      checked={newProduct.size.includes(size)}
                      onChange={handleSizeChange}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
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
                <td>{product.price?.toLocaleString("vi-VN") || "N/A"} VNĐ</td>
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
                      onClick={() => handleDelete(product._id)}
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
    </div>
  );
};

export default Product;
