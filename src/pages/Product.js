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
    stock: 0,
    sold: "",
    description: "",
    images: [""],
    size_items: [],
    categoryCode: "",
  });
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();
      setProducts(data);
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

  // Hanle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validate
    if (!newProduct.name.trim()){
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (
      newProduct.images.length === 0 ||
      newProduct.images.every((img) => !img.trim())
    ) {
      alert("Vui lòng nhập ít nhất một link hình ảnh!");
      return;
    }
    if ( newProduct.size_items.length === 0) {
      alert("Vui lòng chọn ít nhất một size!");
      return;
    }
    if (!newProduct.description.trim()){
      alert("Vui lòng nhập mô tả sản phẩm!");
      return;
    }
    try {
      // Filter out empty image URLs
      const filteredImages = newProduct.images.filter(img => img.trim() !== '');
      
      newProduct.stock = newProduct.size_items.reduce((acc, item) => acc + item.quantity, 0);
      // Chuyển đổi price và stock thành số
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        sold: Number(newProduct.sold || 0),
        images: filteredImages
      };
      
      await productAPI.createProduct(productData);
      fetchProducts();
      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        stock: 0,
        sold: "",
        description: "",
        images: [""],
        size_items: [],
        categoryCode: "",
      });
      alert("Thêm sản phẩm thành công!");
    } catch (err) {
      alert(
        "Không thể thêm sản phẩm: " + (err.message || "Lỗi không xác định")
      );
      console.error("Error adding product:", err);
    }
  };

  const handleSizeToggle = (size, checked) => {
    setNewProduct((prev) => {
      let updated = [...prev.size_items];

      if (checked) {
        updated.push({ size, quantity: 0 });
      } else {
        updated = updated.filter((s) => s.size !== size);
      }

      return { ...prev, size_items: updated };
    });
  };

  const handleSizeQuantityChange = (size, quantity) => {
  setNewProduct((prev) => ({
    ...prev,
    size_items: prev.size_items.map((s) =>
      s.size === size ? { ...s, quantity } : s
    )
  }));
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
              <button 
                type="button"
                className="btn btn-add-image"
                onClick={addImageField}>
                + Thêm hình ảnh
              </button>
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
              <label>Size và số lượng:</label>
              <div className="size-list">
                {["S", "M", "L", "XL"].map((size) => {
                  const selected = newProduct.size_items.find((s) => s.size === size);
                  return (
                    <div key={size} className="size-item">
                      <label className="size-checkbox">
                        <input
                          type="checkbox"
                          value={size}
                          checked={!!selected}
                          onChange={(e) => handleSizeToggle(size, e.target.checked)}
                        />
                        <span>{size}</span>
                      </label>
                      {selected && (
                        <input
                          type="number"
                          className="quantity-input"
                          value={selected.quantity}
                          min={0}
                          onChange={(e) => 
                            handleSizeQuantityChange(size, Number(e.target.value))
                          }
                          placeholder="Số lượng"
                          required
                        />
                      )}
                    </div>
                  );
                })}
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
              <th>Đã bán</th>
              <th>Mã danh mục</th>
              <th>Size</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Reload */}
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name ? product.name : "Không có tên"}</td>
                <td>
                  {typeof product.price === "number" && !isNaN(product.price)
                    ? product.price.toLocaleString("vi-VN") + " VNĐ"
                    : "N/A"}
                </td>
                <td>
                  <div className="product-image">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "https://via.placeholder.com/60x60?text=No+Image"
                      }
                      alt={product.name ? product.name : "No name"}
                    />
                    {product.images && product.images.length > 1 && (
                      <span className="image-count">
                        +{product.images.length - 1}
                      </span>
                    )}
                  </div>
                </td>
                <td>{product.stock ?? "N/A"}</td>
                <td>{product.sold ?? "0"}</td>
                <td>{product.categoryCode || "N/A"}</td>
                <td>
                  {product.sizes && product.sizes.length > 0
                    ? product.sizes.map(s => `${s.size} (${s.quantity})`).join(",")
                    : "N/A"}
                </td>
                <td>
                  <div 
                  className="action-buttons"
                  onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-edit"
                      onClick={() => {
                        /* TODO: Implement edit */
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product._id)
                      }}
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
