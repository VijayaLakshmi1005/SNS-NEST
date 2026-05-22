import { apiRequest } from '../../client/utils/api';

export const adminApiClient = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, data) => apiRequest(url, { method: 'POST', data }),
  put: (url, data) => apiRequest(url, { method: 'PUT', data }),
  patch: (url, data) => apiRequest(url, { method: 'PATCH', data }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
};
