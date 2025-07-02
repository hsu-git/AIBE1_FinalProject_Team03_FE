//API 클라이언트 설정

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    // const { url = '', method, data } = config;

    // const reservePattern = /^\/seats\/concerts\/(\d+)\/seats\/\d+\/reserve$/;
    // const releasePattern = /^\/seats\/concerts\/(\d+)\/seats\/\d+\/release$/;
    // const statusPattern = /^\/seats\/concerts\/(\d+)\/status$/;

    const { url = '' } = config;
    const securePatterns = [/^\/seats\/concerts\/(\d+)/];

    for (const pattern of securePatterns) {
      const match = url.match(pattern);
      if (match) {
        const concertId = match[1];
        const key = sessionStorage.getItem(`accessKey-${concertId}`);
        if (key) {
          config.headers['X-Access-Key'] = key;
        } else {
          console.warn(`세션에 accessKey-${concertId}가 없습니다. URL: ${url}`);
        }
        break; // 매칭되면 루프 종료
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data
    ) {
      if (response.data.success) {
        return response.data;
      } else {
        const errorMessage =
          response.data.message || '알 수 없는 오류가 발생했습니다.';
        const error = new Error(errorMessage);
        error.response = response;
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      const status = error.response.status;
      const originalRequest = error.config;
      const errorMessage =
        error.response.data?.message || `API 호출 실패: ${status}`;

      console.error(`API Error - Status: ${status}, Message: ${errorMessage}`);

      // AccessKey가 만료되어 403 에러를 받고, 해당 요청이 예매 관련 API였다면
      if (status === 403 && originalRequest.url.includes('/reserve')) {
        alert('예매 시간이 만료되었습니다. 콘서트 상세 페이지로 돌아갑니다.');
        // 해당 콘서트의 accessKey를 세션 스토리지에서 삭제
        const concertIdMatch = originalRequest.url.match(/concerts\/(\d+)/);
        if (concertIdMatch) {
          sessionStorage.removeItem(`accessKey-${concertIdMatch[1]}`);
        }
        // 상세 페이지로 리다이렉트
        window.location.href = `/concerts/${
          concertIdMatch ? concertIdMatch[1] : ''
        }`;
        return Promise.reject(error); // 여기서 에러 처리를 끝냄
      }

      // if (status === 401) {
      //   window.location.href = '/login'; // 필요한 경우 로그인 페이지로 리다이렉트
      // }
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      console.error('API Error: 응답을 받지 못했습니다.', error.request);
      return Promise.reject(new Error('네트워크 오류가 발생했습니다.'));
    } else {
      console.error(
        'API Error: 요청 설정 중 오류가 발생했습니다.',
        error.message
      );
      return Promise.reject(new Error('API 요청 설정 중 오류가 발생했습니다.'));
    }
  }
);

export default apiClient;
