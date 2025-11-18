import { data } from "react-router-dom";

// API Configuration
const API_BASE_URL = 'http://localhost:3002/api';

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/login`,
        LOGOUT: `${API_BASE_URL}/logout`,
        PROFILE: `${API_BASE_URL}/profile`,
        CHANGE_PASSWORD: `${API_BASE_URL}/change-password`,
        RESET_PASSWORD: `${API_BASE_URL}/reset-password`,
    },
    USERS: {
        LIST: `${API_BASE_URL}/users`,
        DELETE: (id) => `${API_BASE_URL}/users/${id}`,
    },
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
    },
    BANNERS: {
        LIST: `${API_BASE_URL}/banners`,
        DETAIL: (id) => `${API_BASE_URL}/banners/${id}`,
        CREATE: `${API_BASE_URL}/banners/add`,
        UPDATE: (id) => `${API_BASE_URL}/banners/${id}`,
        DELETE: (id) => `${API_BASE_URL}/banners/${id}`
    }
};

// API Headers
export const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // If no token provided, try to get from localStorage
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

// === AUTH ===
export const authAPI = {
    login: async (credentials) => {
        const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(credentials)
        });
        return handleResponse(res);
    },
    logout: async () => {
        const res = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST', headers: getHeaders()
        });
        return handleResponse(res);
    },
    getProfile: async () => {
        const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    updateProfile: async (data) => {
        const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    changePassword: async (data) => {
        const res = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    resetPassword: async (email) => {
        const res = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify({ email })
        });
        return handleResponse(res);
    }
};

// === USERS ===
export const userAPI = {
    getAllUsers: async () => {
        const res = await fetch(API_ENDPOINTS.USERS.LIST, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    deleteUser: async (id) => {
        const res = await fetch(API_ENDPOINTS.USERS.DELETE(id), {
            method: 'DELETE', headers: getHeaders()
        });
        return handleResponse(res);
    }
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
// === PRODUCT ===
export const productAPI = {
    getAllProducts: async () => {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    getProductById: async (id) => {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    createProduct: async (data) => {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.CREATE, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateProduct: async (id, data) => {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    deleteProduct: async (id) => {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.DELETE(id), {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};
// === BANNERS ===
export const bannerAPI = {
    getAllBanners: async () => {
        const res = await fetch(`${API_BASE_URL}/banners`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getActiveBanners: async () => {
        const res = await fetch(`${API_BASE_URL}/banners/active`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getBannerById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/banners/${id}`, { headers: getHeaders() });
        return handleResponse(res);
    },
    createBanner: async (data) => {
        const res = await fetch(`${API_BASE_URL}/banners`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateBanner: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    deleteBanner: async (id) => {
        const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
            method: 'DELETE', headers: getHeaders()
        });
        return handleResponse(res);
    }
};

const apiConfig = {
  API_BASE_URL,
  API_ENDPOINTS,
  getHeaders,
  handleResponse,
  authAPI,
  userAPI,
  categoryAPI,
  productAPI,
  bannerAPI
};

export default apiConfig;
