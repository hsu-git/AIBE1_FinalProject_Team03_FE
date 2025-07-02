// 기존 src/services/api.js에 있던 콘서트 목록 조회 함수(fetchConcerts)를 이곳으로 옮깁니다.
import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

// 콘서트 목록 조회 API
export async function fetchConcerts(page = 0, size = 20) {
  const response = await apiClient.get('/concerts', {
    params: { page, size }
  });
  // 백엔드의 SuccessResponse 구조에 따라, response.data.data.content 또는 response.data.content가 실제 배열이 됩니다.
  // 현재 apiClient.js에서 response.data를 바로 반환하도록 설정되어 있으므로, 여기서는 response.data를 바로 사용합니다.
  return response.data; // Page 객체 전체 (content, totalElements, totalPages 등 포함)
}

export async function searchConcerts(page = 0, size = 20) {
  console.log('call searchConcerts!');
  return null;
}

export async function filterConcerts(page = 0, size = 20) {
  console.log('call filterConcerts!');
  return null;
}

// 콘서트 상세 조회 API
export async function fetchConcertDetail(id) {
  const response = await apiClient.get(`/concerts/${id}`);
  return response.data; // ConcertDTO 객체
}

export async function enterWaitingQueue(concertId) {
  const response = await apiClient.post(`/queue/enter?concertId=${concertId}`);
  console.log('[enterWaitingQueue] ' + response);
  return response.data;
}
