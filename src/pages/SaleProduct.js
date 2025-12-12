import React, { useState, useEffect, useRef } from "react";
import { saleProductAPI, categoryAPI } from "../config/api";
import "../styles/SaleProduct.css";

const SaleProducts = () => {
  const fileInputRef = useRef(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const [newSaleProduct, setNewSaleProduct] = useState({
    name: "",
    price: "",
    discount_percent: "",
    discount_price: 0,
    stock: 0,
    sold: "",
    description: "",
    images: [""],
    size_items: [],
    categoryCode: "",
    isActive: true,
  });

  useEffect(() => {
    fetchSaleProducts();
    fetchCategories();
  }, []);

  const fetchSaleProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await saleProductAPI.getAllSaleProducts();
      const formattedData = data.map((product) => ({
        ...product,
        price: product.price || 0,
        discount_price: product.discount_price || 0,
        discount_percent: product.discount_percent || 0,
        stock: product.stock || 0,
        sold: product.sold || 0,
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        images: Array.isArray(product.images) ? product.images : [],
        isActive: product.isActive ?? true,
        categoryIsActive: product.categoryIsActive // Lấy trạng thái danh mục từ BE
      }));
      setSaleProducts(formattedData);
    } catch (error) {
      console.error("Error fetching sale products:", error);
      setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  const getPublicId = (url) => {
    try {
      const regex = /upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/;
      const match = url.match(regex);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  };

  const isDuplicateImage = (images, editingId = null) => {
    const publicIds = images.filter((i) => i.trim() !== "").map(getPublicId);
    const set = new Set();
    for (let id of publicIds) {
      if (set.has(id)) return true;
      set.add(id);
    }
    return saleProducts.some((p) => {
      if (editingId && p._id === editingId) return false;
      const existing = (p.images || []).map(getPublicId);
      return existing.some((id) => publicIds.includes(id));
    });
  };

  const handleSaleImagesChange = (index, value) => {
    const clean = value.trim();
    const clone = [...newSaleProduct.images];
    clone[index] = clean;

    if (isDuplicateImage(clone, editingProduct?._id)) {
      alert("Ảnh đã tồn tại!");
      return;
    }
    setNewSaleProduct((prev) => ({ ...prev, images: clone }));
  };

  const handleSelectImageFromPC = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3002/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Upload ảnh thất bại!");
        return;
      }
      const uploadedUrl = data.url.trim();
      const currentImages = newSaleProduct.images.filter((img) => img.trim() !== "");
      if (isDuplicateImage([...currentImages, uploadedUrl], editingProduct?._id)) {
        alert("Ảnh này đã tồn tại trong hệ thống!");
        return;
      }

      setNewSaleProduct((prev) => {
        let imgs = prev.images.filter((img) => img.trim() !== "");
        return {
          ...prev,
          images: [...imgs, uploadedUrl],
        };
      });
    } catch (err) {
      console.error(err);
      alert("Lỗi upload ảnh!");
    }
    e.target.value = null;
  };

  const addSaleImageField = () => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeSaleImageField = (index) => {
    setNewSaleProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewSaleProduct({
      ...product,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [""],
      size_items: Array.isArray(product.sizes)
        ? product.sizes.map((s) => ({ size: s.size, quantity: s.quantity }))
        : [],
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await saleProductAPI.toggleSaleProductStatus(id);
      setSaleProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, isActive: !product.isActive } : product
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      alert(`Không thể thay đổi trạng thái! Lỗi: ${err.message}`);
      fetchSaleProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const name = formData.get("name")?.trim();
    const price = parseFloat(formData.get("price"));
    const discountPercent = parseFloat(formData.get("discount_percent"));
    const sold = parseInt(formData.get("sold"));
    const description = formData.get("description")?.trim();
    const categoryCode = formData.get("categoryCode")?.trim();
    
    const validImages = newSaleProduct.images.filter((img) => img.trim() !== "");
    const size_items = newSaleProduct.size_items;
    
    // Tính tổng stock từ size
    const stock = size_items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

    const missingFields = [];
    if (!name) missingFields.push("Tên sản phẩm");
    if (!price && price !== 0) missingFields.push("Giá gốc");
    if (!discountPercent && discountPercent !== 0) missingFields.push("Phần trăm giảm giá");
    if (!description) missingFields.push("Mô tả");
    if (validImages.length === 0) missingFields.push("Hình ảnh");
    if (size_items.length === 0) missingFields.push("Kích thước");
    if (!categoryCode) missingFields.push("Danh mục");

    if (missingFields.length > 0) {
      alert(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(", ")}`);
      return;
    }

    if (price < 0) {
      alert("Giá sản phẩm không được âm!");
      return;
    }
    if (discountPercent < 0 || discountPercent > 100) {
      alert("Phần trăm giảm giá phải từ 0 đến 100!");
      return;
    }
    if (sold < 0) {
      alert("Số lượng đã bán không được âm!");
      return;
    }
    
    for (const item of size_items) {
      if (item.quantity === "" || Number(item.quantity) <= 0) {
        alert(`Vui lòng nhập số lượng > 0 cho size ${item.size}`);
        return;
      }
    }

    if (isDuplicateImage(validImages, editingProduct?._id)) {
      alert("Hình ảnh sản phẩm đã tồn tại. Vui lòng thay đổi ảnh khác!");
      return;
    }

    const productData = {
      name,
      price,
      discount_percent: discountPercent,
      stock,
      sold: sold ?? 0,
      description,
      images: validImages,
      size_items,
      categoryCode,
      isActive: editingProduct ? editingProduct.isActive : true,
    };

    try {
      if (editingProduct) {
        const updatedProduct = await saleProductAPI.updateSaleProduct(
          editingProduct._id,
          productData
        );
        setSaleProducts(
          saleProducts.map((p) =>
            p._id === editingProduct._id
            ? {
                ...updatedProduct,
                sizes: size_items, 
                images: Array.isArray(updatedProduct.images) ? updatedProduct.images : [],
                categoryIsActive: p.categoryIsActive // Giữ nguyên trạng thái danh mục cũ
              }
            : p
          )
        );
      } else {
        const newProduct = await saleProductAPI.createSaleProduct(productData);
        setSaleProducts([
          {
            ...newProduct,
            sizes: size_items,
            images: Array.isArray(newProduct.images) ? newProduct.images : [],
            categoryIsActive: true // Mới tạo mặc định true (hoặc fetch lại để chắc chắn)
          },
          ...saleProducts,
        ]);
      }

      setShowForm(false);
      setEditingProduct(null);
      e.target.reset();
      alert(editingProduct ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.message || "Có lỗi xảy ra khi lưu sản phẩm!");
    }
  };

  const handleSizeToggle = (size, checked) => {
    setNewSaleProduct((prev) => {
      let updated = [...prev.size_items];
      if (checked) {
        updated.push({ size, quantity: "" });
      } else {
        updated = updated.filter((s) => s.size !== size);
      }
      
      const totalStock = updated.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
      
      return { ...prev, size_items: updated, stock: totalStock };
    });
  };

  const handleSizeQuantityChange = (size, value) => {
    if (value === "") {
      setNewSaleProduct(prev => {
        const updatedItems = prev.size_items.map(s =>
          s.size === size ? { ...s, quantity: "" } : s
        );
        const totalStock = updatedItems.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        );
        return { ...prev, size_items: updatedItems, stock: totalStock };
      });
      return;
    }

    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setNewSaleProduct((prev) => {
        const updatedItems = prev.size_items.map((s) =>
          s.size === size ? { ...s, quantity: num } : s
        );
        const totalStock = updatedItems.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        );
        return { ...prev, size_items: updatedItems, stock: totalStock };
      });
    }
  };

  const handleUpdateSoldCount = async (productId, currentSold) => {
    const newSoldCount = prompt("Nhập số lượng đã bán mới:", currentSold);
    if (newSoldCount !== null && !isNaN(newSoldCount)) {
      try {
        await saleProductAPI.updateSoldCount(productId, parseInt(newSoldCount));
        setSaleProducts(
          saleProducts.map((p) =>
            p._id === productId ? { ...p, sold: parseInt(newSoldCount) } : p
          )
        );
        alert("Cập nhật số lượng đã bán thành công!");
      } catch (error) {
        alert(error.message || "Có lỗi xảy ra!");
      }
    }
  };

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedProduct(null);
  };

  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value) || 0;
    const discountPercent = parseInt(document.querySelector('input[name="discount_percent"]').value) || 0;
    const discountPrice = Math.round(price * (1 - discountPercent / 100));
    const discountPriceInput = document.querySelector('input[name="discount_price"]');
    if(discountPriceInput) discountPriceInput.value = discountPrice;
  };

  const handleDiscountPercentChange = (e) => {
    const price = parseInt(document.querySelector('input[name="price"]').value) || 0;
    const discountPercent = parseInt(e.target.value) || 0;
    const discountPrice = Math.round(price * (1 - discountPercent / 100));
    const discountPriceInput = document.querySelector('input[name="discount_price"]');
    if(discountPriceInput) discountPriceInput.value = discountPrice;
  };

  const clearFieldError = (e) => {
    e.target.style.borderColor = "";
    e.target.style.backgroundColor = "";
  };

  if (error) {
    return <div className="sale-products-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="sale-products-container">
      <div className="sale-products-header">
        <h2>Quản lý sản phẩm giảm giá</h2>
        <button
          className="add-product-btn btn-action"
          onClick={() => {
            setEditingProduct(null);
            setNewSaleProduct({
              name: "", price: "", discount_percent: "", discount_price: 0,
              stock: 0, sold: "", description: "", images: [""],
              size_items: [], categoryCode: "", isActive: true
            });
            setShowForm(true);
          }}
        >
          Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm:</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  placeholder="Nhập tên sản phẩm"
                  onFocus={clearFieldError}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giá gốc (VNĐ):</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price || ""}
                    onChange={handlePriceChange}
                    onFocus={clearFieldError}
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phần trăm giảm giá (%):</label>
                  <input
                    type="number"
                    name="discount_percent"
                    min="0"
                    max="100"
                    defaultValue={editingProduct?.discount_percent || ""}
                    onChange={handleDiscountPercentChange}
                    onFocus={clearFieldError}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá sau giảm (VNĐ):</label>
                  <input
                    type="number"
                    name="discount_price"
                    defaultValue={editingProduct?.discount_price || ""}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <div className="form-group">
                  <label>Đã bán:</label>
                  <input
                    type="number"
                    name="sold"
                    defaultValue={editingProduct?.sold || 0}
                    min="0"
                    onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
                    }}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Tổng tồn kho (Tự động tính từ Size):</label>
                <input
                  type="number"
                  value={newSaleProduct.stock} 
                  readOnly
                  style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  required
                />
              </div>

              <div className="form-group">
                <label>Link hình ảnh:</label>
                {newSaleProduct.images.map((image, index) => (
                  <div key={index} className="image-input-group">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleSaleImagesChange(index, e.target.value)}
                      placeholder={`Link hình ảnh ${index + 1}`}
                    />
                    {newSaleProduct.images.length > 1 && (
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
                
                <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="btn btn-add-image btn-action"
                        onClick={() => fileInputRef.current.click()}
                        style={{background: "#2196F3"}}
                    >
                        📁 Chọn ảnh từ máy
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleSelectImageFromPC(e)}
                    />

                    <button
                    type="button"
                    className="btn btn-add-image"
                    onClick={addSaleImageField}
                    >
                    + Thêm link ảnh
                    </button>
                </div>
              </div>

              <div className="form-group">
                <label>Size và số lượng:</label>
                <div className="size-list">
                  {["S", "M", "L", "XL"].map((size) => {
                    const selected = newSaleProduct.size_items.find((s) => s.size === size);
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
                            onKeyDown={(e) => {
                              if (e.key === "-" || e.key === "e") e.preventDefault();
                            }}
                            onChange={(e) => handleSizeQuantityChange(size, e.target.value)}
                            placeholder="SL"
                            required
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="form-group">
                <label>Danh mục:</label>
                <select
                    name="categoryCode"
                    defaultValue={editingProduct?.categoryCode || ""}
                    required
                    style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px"
                    }}
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.code}>
                            {cat.name} ({cat.code})
                        </option>
                    ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết sản phẩm (Giao diện 2 cột) */}
      {showDetail && selectedProduct && (
        <div className="detail-overlay" onClick={handleCloseDetail}>
          <div className="detail-modal product-style-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail-btn" onClick={handleCloseDetail}>&times;</button>
            
            <div className="detail-content-wrapper">
              {/* CỘT TRÁI: ẢNH */}
              <div className="detail-left-col">
                <div className="main-img-box">
                   <img 
                     src={selectedProduct.images?.[0] || selectedProduct.image || "https://via.placeholder.com/300"} 
                     alt={selectedProduct.name} 
                   />
                   {selectedProduct.discount_percent > 0 && (
                      <span className="modal-badge">-{selectedProduct.discount_percent}%</span>
                   )}
                </div>
                <div className="thumb-list">
                   {selectedProduct.images?.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="thumb-img"/>
                   ))}
                </div>
              </div>

              {/* CỘT PHẢI: THÔNG TIN */}
              <div className="detail-right-col">
                 <h2 className="modal-title">{selectedProduct.name}</h2>
                 
                 <div className="modal-section info-grid">
                    <div className="info-item">
                       <span className="label">Danh mục:</span>
                       <span className="value category-tag">{selectedProduct.categoryCode}</span>
                    </div>
                    <div className="info-item">
                       <span className="label">Trạng thái:</span>
                       <span className={`value status-tag ${selectedProduct.isActive ? 'active' : 'inactive'}`}>
                          {selectedProduct.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                       </span>
                    </div>
                 </div>

                 <div className="modal-section price-box">
                    <div className="price-row">
                       <span className="label">Giá gốc:</span>
                       <span className="old-price-modal">{selectedProduct.price?.toLocaleString()} đ</span>
                    </div>
                    <div className="price-row">
                       <span className="label">Giá giảm:</span>
                       <span className="new-price-modal">{selectedProduct.discount_price?.toLocaleString()} đ</span>
                    </div>
                 </div>

                 <div className="modal-section">
                    <p className="section-title">Kho hàng & Kích thước:</p>
                    <div className="stock-info">
                       <span>Tổng tồn: <b>{selectedProduct.stock}</b></span>
                       <span>Đã bán: <b>{selectedProduct.sold}</b></span>
                    </div>
                    <div className="size-grid-modal">
                       {selectedProduct.sizes?.map((s, i) => (
                          <div key={i} className="size-box-modal">
                             <span className="s-name">{s.size}</span>
                             <span className="s-qty">{s.quantity}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="modal-section">
                    <p className="section-title">Mô tả:</p>
                    <div className="desc-box">{selectedProduct.description}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : saleProducts.length === 0 ? (
        <div className="empty-state">
          <h3>Chưa có sản phẩm giảm giá</h3>
          <p>Bắt đầu bằng cách thêm sản phẩm giảm giá đầu tiên</p>
          <button className="add-product-btn" onClick={() => setShowForm(true)}>
            Thêm sản phẩm
          </button>
        </div>
      ) : (
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
                <th>Danh mục</th>
                <th>Trạng thái</th> 
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {saleProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={
                        Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : product.image || "https://via.placeholder.com/50x50?text=No+Image"
                      }
                      alt={product.name}
                      className="table-product-img"
                      onClick={() => handleShowDetail(product)}
                      style={{ cursor: "pointer", width: 50, height: 50, objectFit: "contain", borderRadius: 4 }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>
                    <span className="original-price">
                      {(product.price || 0).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </td>
                  <td>
                    <span className="discount-price">
                      {(product.discount_price || 0).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </td>
                  <td>-{product.discount_percent || 0}%</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleUpdateSoldCount(product._id, product.sold || 0)}
                    >
                      {product.sold || 0}
                    </span>
                  </td>
                  <td>
                    {product.sizes && product.sizes.length > 0
                      ? product.sizes.map((s) => `${s.size} (${s.quantity})`).join(", ")
                      : "N/A"}
                  </td>
                  <td>{product.categoryCode}</td>

                  {/* NÚT SWITCH VỚI LOGIC CHECK DANH MỤC */}
                  <td>
                    {product.categoryIsActive === false ? (
                      <span className="product-status-category">
                        Danh mục đang ẩn
                      </span>
                    ) : (
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={product.isActive}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(product._id);
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    )}
                  </td>

                  <td className="action-cell">
                    <div className="action-group">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SaleProducts;