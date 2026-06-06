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

  const fullUrl = `${API_BASE}${endpoint}`;
  
  // 요청 로깅 (AI 호출인 경우만 자세히)
  if (endpoint.includes('/ai/')) {
    console.log(`[API Request] ${endpoint}`, {
      timestamp: new Date().toISOString(),
      method: config.method || 'GET',
      headers: config.headers
    });
  }

  const response = await fetch(fullUrl, config);

  if (response.status === 204) return null;

  const data = await response.json();

  // 응답 로깅 (AI 호출인 경우만 자세히)
  if (endpoint.includes('/ai/')) {
    console.log(`[API Response] ${endpoint}`, {
      timestamp: new Date().toISOString(),
      status: response.status,
      statusOk: response.ok,
      dataKeys: Object.keys(data),
      error: data.error
    });
  }

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.');
    error.errorCode = data.errorCode;
    error.statusCode = data.statusCode;
    
    if (endpoint.includes('/ai/')) {
      console.error(`[API Error] ${endpoint}`, {
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        errorCode: data.errorCode,
        error: data.error,
        details: data.details
      });
    }
    
    throw error;
  }

  return data;
}
