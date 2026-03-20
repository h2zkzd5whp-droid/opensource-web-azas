// API 클라이언트 - 프론트 전체가 서버와 통신할 때 이 파일을 통해서 함

const API_BASE = '/api';

// 모든 API 호출을 처리하는 함수
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  // 실제 요청 보내기. API_BASE + endpoint = '/api/login' 같은 형태
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || '요청 실패');
    error.errorCode = data.errorCode;
    error.statusCode = data.statusCode;
    throw error;
  }

  return data;
}