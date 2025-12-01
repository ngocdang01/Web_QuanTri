import React, { useState, useEffect } from "react";
import { saleProductAPI } from "../config/api";
import "../styles/SaleProduct.css";

const SaleProducts = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Data Form
  const [newSaleProduct, setNewSaleProduct] = useState({
    name: "",
    price: "",
    discount_percent: "",
    discount_price: "",
    description: "",
    images: [""], 
    size_items: [],
    categoryCode: "",
    sold: 0,
  });
  const openAddForm = () => {
  setNewSaleProduct({
    name: "",
    price: "",
    discount_percent: "",
    discount_price: "",
    description: "",
    images: [""],
    size_items: [],
    categoryCode: "",
    sold: 0,
  });

  setShowForm(true);
};


  // FETCH DATA
  useEffect(() => {
    loadSaleProducts();
  }, []);

  const loadSaleProducts = async () => {
    try {
      const data = await saleProductAPI.getAllSaleProducts();
      const formatted = data.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        size_items: Array.isArray(p.sizes) ? p.sizes : [],
      }));
      setSaleProducts(formatted);
    } catch (err) {
      console.log("Error load sale products:", err);
      alert("Lỗi khi tải dữ liệu sản phẩm!");
    }
  };

  // Xóa border warning khi focus
  const clearFieldError = (e) => {
    e.target.style.borderColor = "";
    e.target.style.backgroundColor = "";
  };

  const addSaleImageField = () => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const removeSaleImageField = (index) => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSaleImagesChange = (index, value) => {
    setNewSaleProduct((prev) => {
      const updated = [...prev.images];
      updated[index] = value;
      return { ...prev, images: updated };
    });
  };

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

  const handleSizeQuantityChange = (size, qty) => {
    setNewSaleProduct((prev) => ({
      ...prev,
      size_items: prev.size_items.map((s) =>
        s.size === size ? { ...s, quantity: qty } : s
      )
    }));
  };

  const handleSubmit = async(e) => {
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

    const body = {
    name: newSaleProduct.name.trim(),
    price: Number(newSaleProduct.price),
    discount_percent: Number(newSaleProduct.discount_percent),
    discount_price: Number(newSaleProduct.discount_price),
    description: newSaleProduct.description.trim(),
    images: newSaleProduct.images.filter((i) => i.trim() !== ""),
    size_items: newSaleProduct.size_items,
    categoryCode: newSaleProduct.categoryCode.trim(),
    sold: 0,
    stock: newSaleProduct.size_items.reduce(
      (total, s) => total + Number(s.quantity),
      0
    ),
  };

  try {
    const saved = await saleProductAPI.createSaleProduct(body);
    setSaleProducts((prev) => [...prev, saved]);

    alert("Thêm sản phẩm thành công!");
    setShowForm(false);
    setNewSaleProduct({
      name: "",
      price: "",
      discount_percent: "",
      discount_price: "",
      description: "",
      images: [""],
      size_items: [],
      categoryCode: "",
      sold: 0,
    });

  } catch (error) {
    console.log("Lỗi tạo sản phẩm:", error);
    alert("Có lỗi khi thêm sản phẩm!");
  }

  };

  return (
    <div className="sale-products-container">
      <div className="sale-products-header">
        <h2>Quản lý sản phẩm giảm giá</h2>
        <button
          className="add-product-btn btn-action"
          onClick={openAddForm}
        >
          Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">

            <h3>Thêm sản phẩm mới</h3>

            <form onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label>Giá sau giảm:</label>
                <input
                  type="number"
                  value={newSaleProduct.discount_price}
                  readOnly
                  style={{ background: "#eee" }}
                />
              </div>
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
              {saleProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: 20 }}>
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                saleProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        className="table-product-img"
                        src={
                          Array.isArray(product.images) && product.images.length > 0
                            ? product.images[0]
                            : "https://via.placeholder.com/60"
                        }
                        alt={product.name}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <span className="original-price">
                        {(product.price || 0).toLocaleString("vi-VN")} VNĐ
                      </span>
                    </td>
                    <td className="discount-price">
                      {(product.discount_price || 0).toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td>-{product.discount_percent || 0}%</td>
                    <td>
                      {product.size_items?.reduce(
                        (sum, s) => sum + Number(s.quantity || 0),
                        0
                      )}
                    </td>
                    <td>{product.sold || 0}</td>
                    <td>
                      {Array.isArray(product.size_items) && product.size_items.length > 0
                        ? product.size_items
                            .map((s) => `${s.size} (${s.quantity})`)
                            .join(", ")
                        : "N/A"}
                    </td>
                    <td>{product.categoryCode}</td>

                    <td className="action-cell">
                      <div className="action-group">
                        <button className="btn btn-edit">Sửa</button>
                        <button className="btn btn-delete">Xóa</button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
        </table>
      </div>

    </div>
  );
};

export default SaleProducts;
