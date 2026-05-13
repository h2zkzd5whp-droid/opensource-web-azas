const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.');
    error.errorCode = data.errorCode;
    error.statusCode = data.statusCode;
    throw error;
  }

  return data;
}
