import React, { useState } from "react";
import "../styles/SaleProduct.css";

const SaleProducts = () => {
  const [showForm, setShowForm] = useState(false);

  // Dữ liệu sản phẩm trong Form
  const [newSaleProduct, setNewSaleProduct] = useState({
    name: "",
    price: "",
    discount_percent: "",
    discount_price: "",
    description: "",
    images: [""], // nhập nhiều ảnh
    size_items: [],
    categoryCode: ""
  });

  // Xóa border warning khi focus
  const clearFieldError = (e) => {
    e.target.style.borderColor = "";
    e.target.style.backgroundColor = "";
  };

  // Thêm ô hình ảnh
  const addSaleImageField = () => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  // Xóa ô hình ảnh
  const removeSaleImageField = (index) => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Update link ảnh
  const handleSaleImagesChange = (index, value) => {
    setNewSaleProduct((prev) => {
      const updated = [...prev.images];
      updated[index] = value;
      return { ...prev, images: updated };
    });
  };

  // Tính giá giảm
  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value) || 0;
    const percent = parseInt(newSaleProduct.discount_percent) || 0;
    const discountPrice = Math.round(price * (1 - percent / 100));

    setNewSaleProduct((prev) => ({
      ...prev,
      price,
      discount_price: discountPrice
    }));
  };

  const handleDiscountPercentChange = (e) => {
    const percent = parseInt(e.target.value) || 0;
    const price = parseInt(newSaleProduct.price) || 0;
    const discountPrice = Math.round(price * (1 - percent / 100));

    setNewSaleProduct((prev) => ({
      ...prev,
      discount_percent: percent,
      discount_price: discountPrice
    }));
  };

  // Tick chọn size
  const handleSizeToggle = (size, checked) => {
    setNewSaleProduct((prev) => {
      let updated = [...prev.size_items];

      if (checked) {
        updated.push({ size, quantity: 0 });
      } else {
        updated = updated.filter((s) => s.size !== size);
      }

      return { ...prev, size_items: updated };
    });
  };

  // Nhập số lượng theo size
  const handleSizeQuantityChange = (size, qty) => {
    setNewSaleProduct((prev) => ({
      ...prev,
      size_items: prev.size_items.map((s) =>
        s.size === size ? { ...s, quantity: qty } : s
      )
    }));
  };

  // Submit form — CHƯA GỬI API (commit 3 sẽ làm)
  const handleSubmit = (e) => {
    e.preventDefault();

    const missing = [];

    if (!newSaleProduct.name.trim()) missing.push("Tên sản phẩm");
    if (!newSaleProduct.price) missing.push("Giá gốc");
    if (!newSaleProduct.discount_percent) missing.push("Phần trăm giảm");
    if (!newSaleProduct.description.trim()) missing.push("Mô tả");
    if (newSaleProduct.images.filter((i) => i.trim() !== "").length === 0)
      missing.push("Hình ảnh");
    if (newSaleProduct.size_items.length === 0) missing.push("Kích thước");
    if (!newSaleProduct.categoryCode.trim()) missing.push("Danh mục");

    if (missing.length > 0) {
      alert("Vui lòng nhập: " + missing.join(", "));
      return;
    }

    alert("Dữ liệu hợp lệ (commit 3 sẽ xử lý gửi API)");
    setShowForm(false);
  };

  return (
    <div className="sale-products-container">

      {/* HEADER */}
      <div className="sale-products-header">
        <h2>Quản lý sản phẩm giảm giá</h2>
        <button
          className="add-product-btn btn-action"
          onClick={() => setShowForm(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">

            <h3>Thêm sản phẩm mới</h3>

            <form onSubmit={handleSubmit}>
              {/* TÊN */}
              <div className="form-group">
                <label>Tên sản phẩm:</label>
                <input
                  type="text"
                  value={newSaleProduct.name}
                  onFocus={clearFieldError}
                  onChange={(e) =>
                    setNewSaleProduct({ ...newSaleProduct, name: e.target.value })
                  }
                />
              </div>

              {/* GIÁ */}
              <div className="form-row">
                <div className="form-group">
                  <label>Giá gốc:</label>
                  <input
                    type="number"
                    value={newSaleProduct.price}
                    onFocus={clearFieldError}
                    onChange={handlePriceChange}
                  />
                </div>

                <div className="form-group">
                  <label>% Giảm:</label>
                  <input
                    type="number"
                    value={newSaleProduct.discount_percent}
                    onFocus={clearFieldError}
                    onChange={handleDiscountPercentChange}
                  />
                </div>
              </div>

              {/* GIÁ SAU GIẢM */}
              <div className="form-group">
                <label>Giá sau giảm:</label>
                <input
                  type="number"
                  value={newSaleProduct.discount_price}
                  readOnly
                  style={{ background: "#eee" }}
                />
              </div>

              {/* MÔ TẢ */}
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={newSaleProduct.description}
                  onChange={(e) =>
                    setNewSaleProduct({
                      ...newSaleProduct,
                      description: e.target.value
                    })
                  }
                />
              </div>

              {/* HÌNH ẢNH */}
              <div className="form-group">
                <label>Link hình ảnh:</label>

                {newSaleProduct.images.map((img, index) => (
                  <div key={index} className="image-input-group">
                    <input
                      type="url"
                      value={img}
                      placeholder={`Link hình ${index + 1}`}
                      onChange={(e) =>
                        handleSaleImagesChange(index, e.target.value)
                      }
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-remove"
                        onClick={() => removeSaleImageField(index)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-add-image"
                  onClick={addSaleImageField}
                >
                  + Thêm hình
                </button>
              </div>

              {/* SIZE */}
              <div className="form-group">
                <label>Size & số lượng:</label>
                <div className="size-list">
                  {["S", "M", "L", "XL"].map((size) => {
                    const selected = newSaleProduct.size_items.find(
                      (s) => s.size === size
                    );
                    return (
                      <div key={size} className="size-item">
                        <label className="size-checkbox">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={(e) =>
                              handleSizeToggle(size, e.target.checked)
                            }
                          />
                          <span>{size}</span>
                        </label>

                        {selected && (
                          <input
                            type="number"
                            value={selected.quantity}
                            min={0}
                            className="quantity-input"
                            placeholder="Số lượng"
                            onChange={(e) =>
                              handleSizeQuantityChange(size, Number(e.target.value))
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DANH MỤC */}
              <div className="form-group">
                <label>Mã danh mục:</label>
                <input
                  type="text"
                  value={newSaleProduct.categoryCode}
                  onChange={(e) =>
                    setNewSaleProduct({
                      ...newSaleProduct,
                      categoryCode: e.target.value
                    })
                  }
                />
              </div>

              {/* ACTION */}
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TABLE UI (giữ nguyên như commit 1) */}
      <div className="sale-products-table-wrapper">
        <table className="sale-products-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Giá gốc</th>
              <th>Giá giảm</th>
              <th>%</th>
              <th>Tồn kho</th>
              <th>Đã bán</th>
              <th>Size</th>
              <th>Danh mục</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <img
                  className="table-product-img"
                  src="https://via.placeholder.com/60"
                  alt="Ảnh"
                />
              </td>
              <td>Sản phẩm mẫu</td>
              <td>500.000</td>
              <td className="discount-price">350.000</td>
              <td>-30%</td>
              <td>100</td>
              <td>20</td>
              <td>S(10), M(10)</td>
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
