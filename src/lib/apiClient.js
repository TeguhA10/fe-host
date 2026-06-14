let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const request = async (url, options = {}) => {
  // Always include credentials to send cookies across origins (ports)
  options.credentials = 'include';
  options.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      // If unauthorized on login or refresh, do not retry
      if (url.includes('/api/auth/login') || url.includes('/api/auth/refresh')) {
        const error = await response.json().catch(() => ({ message: 'Autentikasi gagal' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      // Silent refresh logic
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(request(url, options)),
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token expired or invalid');
        }

        isRefreshing = false;
        processQueue(null);
        return request(url, options);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (response.status === 403) {
      window.location.href = '/403';
      throw new Error('Akses ditolak (403)');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export const apiClient = {
  get: (endpoint, options = {}) => {
    return request(endpoint, { method: 'GET', ...options });
  },
  post: (endpoint, body = {}, options = {}) => {
    return request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
  },
  put: (endpoint, body = {}, options = {}) => {
    return request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
  },
  patch: (endpoint, body = {}, options = {}) => {
    return request(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options });
  },
  delete: (endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  },
};
