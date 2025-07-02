//API 클라이언트 설정 - 수정된 버전

import axios from 'axios';

// VITE_APP_API_URL이 이미 /api를 포함하고 있는지 확인하고 처리
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// URL 중복 방지: 만약 API_BASE_URL이 이미 /api로 끝나면 중복 제거
const cleanedBaseURL = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

console.log('🔧 API Base URL:', cleanedBaseURL); // 디버깅용

const apiClient = axios.create({
    baseURL: cleanedBaseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        console.log(
            `🚀 API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        );

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
                    console.warn(
                        `세션에 accessKey-${concertId}가 없습니다. URL: ${url}`,
                    );
                }
                break; // 매칭되면 루프 종료
            }
        }

        return config;
    },
    (error) => {
        console.error('❌ API 요청 에러:', error);
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(
            `✅ API 응답 성공: ${response.status} ${response.config.url}`,
        );

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
            const status = error.response.status;
            const url = error.response.config?.url || 'unknown';
            const originalRequest = error.config;

            // 구체적인 에러 메시지 생성
            let errorMessage = `API 호출 실패: ${status}`;

            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                // 상태 코드별 기본 메시지
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다.';
                        break;
                    case 401:
                        errorMessage = '인증이 필요합니다. 로그인해주세요.';
                        break;
                    case 403:
                        errorMessage = '접근 권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버에 오류가 발생했습니다.';
                        break;
                    default:
                        errorMessage = `서버 오류 (${status})`;
                }
            }

            console.error(
                `❌ API Error - Status: ${status}, URL: ${url}, Message: ${errorMessage}`,
            );

            // 401 에러 시 자동 리다이렉트 (필요한 경우 주석 해제)
            if (status === 401) {
                // console.warn('🔒 인증 필요 - 로그인 페이지로 이동');
                // window.location.href = '/login';
            } else if (status === 403) {
                if (originalRequest.url.includes('/seats/concerts')) {
                    alert(
                        '예매 시간이 만료되었습니다. 콘서트 상세 페이지로 돌아갑니다.',
                    );
                    // 해당 콘서트의 accessKey를 세션 스토리지에서 삭제
                    const concertIdMatch =
                        originalRequest.url.match(/concerts\/(\d+)/);
                    if (concertIdMatch) {
                        sessionStorage.removeItem(
                            `accessKey-${concertIdMatch[1]}`,
                        );
                    }
                    // 상세 페이지로 리다이렉트
                    window.location.href = `/concerts/${
                        concertIdMatch ? concertIdMatch[1] : ''
                    }`;
                    return Promise.reject(error); // 여기서 에러 처리를 끝냄
                }
            }

            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            const networkError =
                '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            console.error('❌ API Network Error:', error.request);
            return Promise.reject(new Error(networkError));
        } else {
            const requestError = 'API 요청 설정 중 오류가 발생했습니다.';
            console.error('❌ API Request Error:', error.message);
            return Promise.reject(new Error(requestError));
        }
    },
);

export default apiClient;
