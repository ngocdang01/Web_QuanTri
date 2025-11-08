// API Configuration
const API_BASE_URL = 'http://localhost:3002/api';

// API Endpoints
export const API_ENDPOINTS = {
    CATEGORIES: {
        LIST: `${API_BASE_URL}/categories`,
        DETAIL: (id) => `${API_BASE_URL}/categories/${id}`,
        CREATE: `${API_BASE_URL}/categories/add`,
        UPDATE: (id) => `${API_BASE_URL}/categories/${id}`,
        DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
    },
    // Product endpoints
    PRODUCTS: {
        LIST: `${API_BASE_URL}/products`,
        DETAIL: (id) => `${API_BASE_URL}/products/${id}`,
        CREATE: `${API_BASE_URL}/products/add`,
        UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
        DELETE: (id) => `${API_BASE_URL}/products/${id}`,
    }
};

// API Headers
export const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // If token is provided, add Authorization header
    const authToken = token || localStorage.getItem('token');
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    return headers;
};

// API Response Handler
export const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    const result = await response.json();
    return result?.data ?? result;
};

// === CATEGORIES ===
export const categoryAPI = {
    getAllCategories: async () => {
        const res = await fetch(API_ENDPOINTS.CATEGORIES.LIST, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    getCategoryById: async (id) => {
        const res = await fetch(API_ENDPOINTS.CATEGORIES.DETAIL(id), {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    createCategory: async (data) => {
        const res = await fetch(API_ENDPOINTS.CATEGORIES.CREATE, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateCategory: async (id, data) => {
        const res = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    deleteCategory: async (id) => {
        const res = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(id), {
            method: 'DELETE', headers: getHeaders()
        });
        return handleResponse(res);
    }
};
// Product API Services
export const productAPI = {
    // Get all products
    getAllProducts: async () => {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Create new product
    createProduct: async (productData) => {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.CREATE, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(productData)
        });
        return handleResponse(response);
    },

    // Update product
    updateProduct: async (id, productData) => {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(productData)
        });
        return handleResponse(response);
    },

    // Delete product
    deleteProduct: async (id) => {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.DELETE(id), {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

const apiConfig = {
  API_BASE_URL,
  API_ENDPOINTS,
  getHeaders,
  handleResponse,
  productAPI
};

export default apiConfig;
