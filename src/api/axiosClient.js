import axios from 'axios';

// Base API URL with environment fallback to local FastAPI server
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

// Create configured Axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Automatically attach JWT Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('dukaankhata_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[AxiosClient] Could not read token from storage:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless error extraction and 401 handling
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid: clear credentials
      localStorage.removeItem('dukaankhata_token');
      localStorage.removeItem('dukaankhata_auth_status');
      window.dispatchEvent(new Event('dukaankhata:unauthorized'));
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

// ============================================================================
// API MODULE EXPORTS
// ============================================================================

export const authAPI = {
  login: async (phone, password) => {
    const data = await axiosClient.post('/api/auth/login', { phone, password });
    if (data?.access_token) {
      localStorage.setItem('dukaankhata_token', data.access_token);
      localStorage.setItem('dukaankhata_auth', JSON.stringify(data.user));
      localStorage.setItem('dukaankhata_auth_status', 'true');
    }
    return data;
  },
  getProfile: () => axiosClient.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('dukaankhata_token');
    localStorage.removeItem('dukaankhata_auth_status');
    localStorage.removeItem('dukaankhata_auth');
  }
};

export const catalogAPI = {
  getCategories: () => axiosClient.get('/api/categories'),
  createCategory: (data) => axiosClient.post('/api/categories', data),
  getUnits: () => axiosClient.get('/api/units'),
  convertQuantity: (data) => axiosClient.post('/api/units/convert', data),
  getProducts: (params = {}) => axiosClient.get('/api/products', { params }),
  getProductById: (id) => axiosClient.get(`/api/products/${id}`),
  createProduct: (data) => axiosClient.post('/api/products', data),
  updateProduct: (id, data) => axiosClient.put(`/api/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/api/products/${id}`),
  getLowStock: () => axiosClient.get('/api/inventory/low-stock')
};

export const purchasesAPI = {
  getPurchases: () => axiosClient.get('/api/purchases'),
  createPurchase: (data) => axiosClient.post('/api/purchases', data)
};

export const posAPI = {
  getSales: (limit = 50) => axiosClient.get('/api/sales', { params: { limit } }),
  checkoutSale: (data) => axiosClient.post('/api/sales', data),
  getReceipt: (saleId) => axiosClient.get(`/api/sales/${saleId}/receipt`)
};

export const khataAPI = {
  getCustomers: (params = {}) => axiosClient.get('/api/khata/customers', { params }),
  getSummary: () => axiosClient.get('/api/khata/customers/summary'),
  getCustomerById: (id) => axiosClient.get(`/api/khata/customers/${id}`),
  createCustomer: (data) => axiosClient.post('/api/khata/customers', data),
  updateCustomer: (id, data) => axiosClient.put(`/api/khata/customers/${id}`, data),
  getStatement: (customerId) => axiosClient.get(`/api/khata/customers/${customerId}/statement`),
  receivePayment: (customerId, data) => axiosClient.post(`/api/khata/customers/${customerId}/receive-payment`, data)
};

export const suppliersAPI = {
  getSuppliers: () => axiosClient.get('/api/suppliers'),
  getSupplierById: (id) => axiosClient.get(`/api/suppliers/${id}`),
  createSupplier: (data) => axiosClient.post('/api/suppliers', data),
  updateSupplier: (id, data) => axiosClient.put(`/api/suppliers/${id}`, data),
  getStatement: (supplierId) => axiosClient.get(`/api/suppliers/${supplierId}/statement`),
  paySupplier: (supplierId, data) => axiosClient.post(`/api/suppliers/${supplierId}/pay`, data)
};

export const expensesAPI = {
  getExpenses: (params = {}) => axiosClient.get('/api/expenses', { params }),
  createExpense: (data) => axiosClient.post('/api/expenses', data),
  deleteExpense: (id) => axiosClient.delete(`/api/expenses/${id}`)
};

export const reportsAPI = {
  getDashboard: (params = { period: 'today' }) => axiosClient.get('/api/dashboard', { params }),
  getCategoryWise: (params = { period: 'monthly' }) => axiosClient.get('/api/reports/category-wise', { params })
};

export default axiosClient;
