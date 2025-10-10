import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, xóa token và chuyển về trang login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API cho authentication
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } catch (error) {
      // Vẫn xóa token ngay cả khi API call thất bại
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// API cho products
export const productAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/products');
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// API cho users
export const userAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/users');
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default apiClient;
