import React, { useState, useEffect, useRef } from "react";
import { productAPI, categoryAPI } from "../config/api";
import "../styles/Product.css";

const Product = () => {
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
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

  const handleOpenAddForm = () => {
    setNewProduct({
      name: "",
      price: "",
      stock: "",
      description: "",
      images: [""],
      categoryCode: "",
      size_items: [],
    });
    setShowAddForm(true);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
  const fetchCategories = async () => {
  try {
    const data = await categoryAPI.getAllCategories();
    setCategories(data);
  } catch (err) {
    console.error("Lỗi lấy danh mục:", err);
  }
};

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImagesChange = (index, value) => {
    const clean = value.trim();

    const clone = [...newProduct.images];
    clone[index] = clean;

    if (isDuplicateImage(clone, editingProduct?._id)) {
      alert("Ảnh đã tồn tại!");
      return;
    }

    setNewProduct((prev) => ({ ...prev, images: clone }));
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
      setNewProduct((prev) => {
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

  // Check trùng tên
  const isDuplicateName = (name) => {
    return products.some(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
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

    // kiểm tra trùng trong chính form
    const set = new Set();
    for (let id of publicIds) {
      if (set.has(id)) return true;
      set.add(id);
    }

    // kiểm tra trùng với sản phẩm khác
    return products.some((p) => {
      if (editingId && p._id === editingId) return false;
      const existing = (p.images || []).map(getPublicId);
      return existing.some((id) => publicIds.includes(id));
    });
  };

  // Hanle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredImages = newProduct.images.filter((img) => img.trim() !== "");

    if (Number(newProduct.price) < 0) {
      alert("Giá sản phẩm không được âm!");
      return;
    }

    if (isDuplicateName(newProduct.name)) {
      alert("Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác!");
      return;
    }

    if (isDuplicateImage(filteredImages)) {
      alert("Hình ảnh sản phẩm đã tồn tại. Vui lòng thay đổi ảnh khác!");
      return;
    }

    //Validate
    if (!newProduct.name.trim()) {
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
    if (newProduct.size_items.length === 0) {
      alert("Vui lòng chọn ít nhất một size!");
      return;
    }
    if (!newProduct.description.trim()) {
      alert("Vui lòng nhập mô tả sản phẩm!");
      return;
    }
    try {
      // Filter out empty image URLs
      const filteredImages = newProduct.images.filter(
        (img) => img.trim() !== ""
      );
      if (isDuplicateImage(filteredImages)) {
        alert("Ảnh đã tồn tại. Không thể thêm sản phẩm!");
        return;
      }

      newProduct.stock = newProduct.size_items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Chuyển đổi price và stock thành số
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        sold: Number(newProduct.sold || 0),
        images: filteredImages,
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

  // Xem chi tiết sản phẩm
  const handleShowDetail = async (id) => {
    setShowDetail(true);
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      const res = await productAPI.getProductById(id + "?admin=true");

      setSelectedProduct(res.data || res);
    } catch (err) {
      setErrorDetail("Không thể tải chi tiết sản phẩm");
      setSelectedProduct(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || 0,
      sold: product.sold || "",
      description: product.description || "",
      images:
      product.images && product.images.length > 0 ? product.images : [""],
      size_items: product.sizes
        ? product.sizes.map(s => ({
            size: s.size,
            quantity: s.quantity
          }))
        : [],
      categoryCode: product.categoryCode || "",
    });
    setShowEditForm(true);
  };

  // Handle update submit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (Number(newProduct.price) < 0) {
      alert("Giá sản phẩm không được âm!");
      return;
    }

    if (!newProduct.name.trim()) {
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
    if (newProduct.size_items.length === 0) {
      alert("Vui lòng chọn ít nhất một size!");
      return;
    }
    if (!newProduct.description.trim()) {
      alert("Vui lòng nhập mô tả sản phẩm!");
      return;
    }
    if (isDuplicateImage(newProduct.images, editingProduct._id)) {
      alert("Ảnh đã tồn tại ở sản phẩm khác hoặc trùng trong chính sản phẩm!");
      return;
    }

    try {
      // Filter out empty image URLs
      const filteredImages = newProduct.images.filter(
        (img) => img.trim() !== ""
      );
      if (isDuplicateImage(newProduct.images, editingProduct._id)) {
        alert("Ảnh đã tồn tại ở sản phẩm khác!");
        return;
      }
      newProduct.stock = newProduct.size_items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        sold: Number(newProduct.sold || 0),
        images: filteredImages,
      };

      await productAPI.updateProduct(editingProduct._id, productData);

      await fetchProducts();
      setShowEditForm(false);
      setEditingProduct(null);
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
      alert("Cập nhật sản phẩm thành công!");
    } catch (err) {
      alert(
        "Không thể cập nhật sản phẩm: " + (err.message || "Lỗi không xác định")
      );
      console.error("Error updating product:", err);
    }
  };

  const handleSizeToggle = (size, checked) => {
  setNewProduct((prev) => {
    let updated = [...prev.size_items];

    if (checked) {
      updated.push({ size, quantity: ""});
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


  const handleSizeQuantityChange = (size, quantity) => {
    setNewProduct((prev) => {
      const updated = prev.size_items.map((s) =>
        s.size === size
          ? { ...s, quantity: quantity === "" ? "" : Number(quantity) }
          : s
      );

      const totalStock = updated.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );

      return { ...prev, size_items: updated, stock: totalStock };
    });
  };



  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
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
  // 🔥 Toggle trạng thái sản phẩm (Ẩn / Hiện)
  const handleToggleStatus = async (id) => {
    try {
      await productAPI.toggleProductStatus(id);
      await fetchProducts();
      alert("Thay đổi trạng thái thành công!");
    } catch (err) {
      console.error("Toggle status error:", err);
      alert("Không thể thay đổi trạng thái sản phẩm!");
    }
  };


  // Add pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-container">
      <div className="product-header">
        <h2>Quản lý sản phẩm</h2>
        <button className="btn btn-add" onClick={handleOpenAddForm}>
          Thêm
        </button>
      </div>
      {/* Modal Thêm sản phẩm */}
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
                min={0}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
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
              <label>Hình ảnh:</label>
              {newProduct.images.map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImagesChange(index, e.target.value)}
                    placeholder={`Link hình ảnh ${index + 1}`}
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

              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-add-image"
                  onClick={() => fileInputRef.current.click()}
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
              </div>

              <button
                type="button"
                className="btn btn-add-image"
                onClick={addImageField}
              >
                + Thêm link ảnh
              </button>
            </div>

            <div className="form-group">
              <label>Mã danh mục:</label>
              <select
                name="categoryCode"
                value={newProduct.categoryCode}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.code}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Size và số lượng:</label>
              <div className="size-list">
                {["S", "M", "L", "XL"].map((size) => {
                  const selected = newProduct.size_items.find(
                    (s) => s.size === size
                  );
                  return (
                    <div key={size} className="size-item">
                      <label className="size-checkbox">
                        <input
                          type="checkbox"
                          value={size}
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
                          className="quantity-input"
                          value={selected.quantity === 0 ? "" : selected.quantity}
                          min={0}
                          onChange={(e) =>
                            handleSizeQuantityChange(size, e.target.value)
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

      {/* Modal cập nhật sản phẩm */}
      {showEditForm && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowEditForm(false)}
          ></div>
          <form onSubmit={handleUpdate} className="form-content">
            <h3>Sửa sản phẩm</h3>
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
                min={0}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
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
                readOnly
                onKeyDown={(e) => e.preventDefault()}
                onWheel={(e) => e.target.blur()}
                style={{
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                  pointerEvents: "none"
                }}
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
              <label>Hình ảnh:</label>
              {newProduct.images.map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImagesChange(index, e.target.value)}
                    placeholder={`Link hình ảnh ${index + 1}`}
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

              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-add-image btn-action"
                  onClick={() => fileInputRef.current.click()}
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
              </div>

              <button
                type="button"
                className="btn btn-add-image btn-action"
                onClick={addImageField}
              >
                + Thêm hình ảnh
              </button>
            </div>
            <div className="form-group">
              <label>Mã danh mục:</label>
              <select
                name="categoryCode"
                value={newProduct.categoryCode}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.code}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>

            </div>
            <div className="form-group">
              <label>Size và số lượng:</label>
              <div className="size-list">
                {["S", "M", "L", "XL"].map((size) => {
                  const selected = newProduct.size_items.find(
                    (s) => s.size === size
                  );
                  return (
                    <div key={size} className="size-item">
                      <label className="size-checkbox">
                        <input
                          type="checkbox"
                          value={size}
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
                          className="quantity-input"
                          value={selected.quantity === "" ? "" : selected.quantity}
                          min={0}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") e.preventDefault();
                          }}
                          onChange={(e) =>
                            handleSizeQuantityChange(size, e.target.value)
                          }
                          placeholder="Số lượng"
                          required
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-submit">
                Cập nhật
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowEditForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal chi tiết sản phẩm */}
      {showDetail && (
        <div className="add-product-form">
          <div
            className="form-overlay"
            onClick={() => setShowDetail(false)}
          ></div>
          <div className="form-content">
            {loadingDetail ? (
              <div className="loading">Đang tải chi tiết...</div>
            ) : errorDetail ? (
              <div className="error">{errorDetail}</div>
            ) : selectedProduct ? (
              <>
                <h3>Chi tiết sản phẩm</h3>
                <div className="product-images">
                  {selectedProduct.images &&
                  selectedProduct.images.length > 0 ? (
                    selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={
                          image ||
                          "https://via.placeholder.com/120x120?text=No+Image"
                        }
                        alt={`${selectedProduct.name || "Product"} ${
                          index + 1
                        }`}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "contain",
                          borderRadius: 8,
                          margin: "0.5rem",
                          background: "#fff",
                          border: "1px solid #ddd",
                        }}
                      />
                    ))
                  ) : (
                    <img
                      src="https://via.placeholder.com/120x120?text=No+Image"
                      alt="No product available"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "contain",
                        borderRadius: 8,
                        margin: "0 auto 1rem",
                        background: "#fff",
                        display: "block",
                        border: "1px solid #ddd",
                      }}
                    />
                  )}
                </div>
                <p>
                  <b>Tên:</b> {selectedProduct.name || "Không có tên"}
                </p>
                <p>
                  <b>Giá:</b>{" "}
                  {typeof selectedProduct.price === "number"
                    ? selectedProduct.price.toLocaleString("vi-VN") + " VNĐ"
                    : "N/A"}
                </p>
                <p>
                  <b>Tồn kho:</b> {selectedProduct.stock ?? "N/A"}
                </p>
                <p>
                  <b>Đã bán:</b> {selectedProduct.sold ?? "0"}
                </p>
                <p>
                  <b>Mã danh mục:</b> {selectedProduct.categoryCode || "N/A"}
                </p>
                <p>
                  <b>Size có sẵn:</b>{" "}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0
                    ? selectedProduct.sizes
                        .map((s) => `${s.size} (${s.quantity})`)
                        .join(", ")
                    : "N/A"}
                </p>
                <p>
                  <b>Mô tả:</b>{" "}
                  {selectedProduct.description || "Không có mô tả"}
                </p>
                <p>
                  <b>Ngày cập nhật:</b> {formatDate(selectedProduct.updatedAt)}
                </p>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowDetail(false)}
                >
                  Đóng
                </button>
              </>
            ) : null}
          </div>
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
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Reload */}
           {currentProducts.map((product) => {
  // ⭐ 1. Logic xác định trạng thái hiển thị
  let statusLabel = "";
  let statusClass = "";

  if (product.categoryIsActive === false) {
    statusLabel = "Ẩn (Theo danh mục)";
    statusClass = "status-hidden-category";
  } else if (product.isActive) {
    statusLabel = "Hiển thị";
    statusClass = "status-active";
  } else {
    statusLabel = "Đang ẩn";
    statusClass = "status-hidden";
  }

  // ⭐ 2. Logic cảnh báo tồn kho
  let stockStyle = {};
  if (product.stock === 0) {
    stockStyle = { color: "red", fontWeight: "bold" };
  } else if (product.stock < 10) {
    stockStyle = { color: "orange", fontWeight: "bold" };
  }

  return (
    <tr key={product._id} style={{ cursor: "default" }}>
      {/* Mã sản phẩm dạng rút gọn */}
      <td>
        {product._id
          ? `${product._id.slice(0, 1)}...${product._id.slice(-4)}`
          : ""}
      </td>

      {/* Tên sản phẩm */}
      <td
        onClick={() => handleShowDetail(product._id)}
        style={{ cursor: "pointer" }}
      >
        {product.name || "Không có tên"}
      </td>

      {/* Giá */}
      <td>
        {typeof product.price === "number" && !isNaN(product.price)
          ? product.price.toLocaleString("vi-VN") + " VNĐ"
          : "N/A"}
      </td>

      {/* Ảnh sản phẩm */}
      <td
        onClick={() => handleShowDetail(product._id)}
        style={{ cursor: "pointer" }}
      >
        <div className="product-image">
          <img
            src={
              product.images && product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/60x60?text=No+Image"
            }
            alt={product.name || "No name"}
          />
          {product.images && product.images.length > 1 && (
            <span className="image-count">+{product.images.length - 1}</span>
          )}
        </div>
      </td>

      {/* ⭐ TỒN KHO – có cảnh báo */}
      <td style={stockStyle}>
        {product.stock ?? "N/A"}
        {product.stock === 0 && <span title="Hết hàng"> ⚠️</span>}
      </td>

      {/* Đã bán */}
      <td>{product.sold ?? "0"}</td>

      {/* Mã danh mục */}
      <td>{product.categoryCode || "N/A"}</td>

      {/* Size */}
      <td>
        {product.sizes && product.sizes.length > 0
          ? product.sizes
              .map((s) => `${s.size} (${s.quantity})`)
              .join(", ")
          : "N/A"}
      </td>

      {/* ⭐ TRẠNG THÁI MỚI */}
      <td>
        <span
          className={statusClass}
          style={
            statusClass === "status-hidden-category"
              ? {
                  background: "#fff3cd",
                  color: "#856404",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #ffeeba",
                }
              : {}
          }
        >
          {statusLabel}
        </span>
      </td>

      {/* Nút thao tác */}
      <td>
        <div className="action-buttons">
          <button
            className="btn btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
            }}
          >
            Sửa
          </button>

          {/* ⭐ Chỉ toggle isActive của sản phẩm */}
          <button
            className={`btn ${
              product.isActive ? "btn-disable" : "btn-enable"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(product._id);
            }}
          >
            {product.isActive ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </td>
    </tr>
  );
})}

          </tbody>
        </table>
      </div>

      {/* Add pagination controls */}
      <div className="pagination">
        <button
          className="btn btn-pagination"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`btn btn-pagination ${
              currentPage === index + 1 ? "active" : ""
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn btn-pagination"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Product;
