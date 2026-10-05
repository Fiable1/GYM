import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // The API returns paginated payloads as { items, total, page, limit, totalPages }.
    // Admin pages read `res.data.data`, so alias it here rather than in every page.
    const body = res.data;
    if (body && typeof body === 'object' && !Array.isArray(body) && Array.isArray(body.items)) {
      res.data = { ...body, data: body.items };
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pf_token');
      localStorage.removeItem('pf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
