// src/features/concert/services/concertService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from '../../../shared/utils/apiClient.js';

/**
 * 콘서트 관련 API 호출 서비스
 * 백엔드의 ConcertController, SellerConcertController와 1:1 매핑
 */
export const concertService = {
    // ==================== 일반 사용자용 API ====================

    /**
     * 콘서트 목록 조회 (페이지네이션)
     * 백엔드: GET /api/concerts
     * @param {import('../types/concert.js').ConcertListParams} params - 페이지 정보
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').PageResponse<import('../types/concert.js').Concert[]>>>}
     */
    async getConcerts(params = { page: 0, size: 20 }) {
        try {
            // axios의 params 옵션을 사용해 쿼리 파라미터 자동 생성 (?page=0&size=20)
            const response = await apiClient.get('/concerts', { params });

            // apiClient가 이미 SuccessResponse를 처리해서 { success, message, data } 형태로 반환
            return response;
        } catch (error) {
            // 개발/디버깅용 에러 로깅
            console.error('콘서트 목록 조회 실패:', error);

            // 에러를 다시 throw해서 호출하는 쪽에서 처리할 수 있도록 함
            throw error;
        }
    },

    /**
     * 콘서트 상세 정보 조회
     * 백엔드: GET /api/concerts/{id}
     * @param {number} concertId - 조회할 콘서트 ID
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').Concert>>}
     */
    async getConcertById(concertId) {
        try {
            // 템플릿 리터럴을 사용해 동적 URL 생성 (/api/concerts/123)
            const response = await apiClient.get(`/concerts/${concertId}`);
            return response;
        } catch (error) {
            // 어떤 콘서트 ID에서 실패했는지 로그에 포함
            console.error(`콘서트 상세 조회 실패 (ID: ${concertId}):`, error);
            throw error;
        }
    },

    /**
     * 콘서트 키워드 검색
     * 백엔드: GET /api/concerts/search?query={keyword}
     * @param {string} query - 검색 키워드 (제목, 아티스트, 공연장명)
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').Concert[]>>}
     */
    async searchConcerts(query) {
        try {
            // 쿼리 파라미터로 검색 키워드 전달
            const response = await apiClient.get('/concerts/search', {
                params: { query }, // ?query=아이유 형태로 변환됨
            });
            return response;
        } catch (error) {
            // 어떤 키워드로 검색했는지 로그에 포함
            console.error(`콘서트 검색 실패 (키워드: ${query}):`, error);
            throw error;
        }
    },

    /**
     * 콘서트 고급 필터링
     * 백엔드: GET /api/concerts/filter?startDate=...&endDate=...&priceMin=...&priceMax=...
     * @param {import('../types/concert.js').ConcertFilterParams} filterParams - 필터 조건들
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').Concert[]>>}
     */
    async filterConcerts(filterParams) {
        try {
            // 여러 필터 조건을 쿼리 파라미터로 전달
            // { startDate: '2025-01-01', endDate: '2025-12-31' }
            // -> ?startDate=2025-01-01&endDate=2025-12-31
            const response = await apiClient.get('/concerts/filter', {
                params: filterParams,
            });
            return response;
        } catch (error) {
            console.error('콘서트 필터링 실패:', error);
            throw error;
        }
    },

    /**
     * 콘서트 AI 요약 조회
     * 백엔드: GET /api/concerts/{id}/ai-summary
     * @param {number} concertId - 콘서트 ID
     * @returns {Promise<import('../types/concert.js').ApiResponse<string>>}
     */
    async getAISummary(concertId) {
        try {
            // 특정 콘서트의 AI 생성 요약 텍스트를 가져옴
            const response = await apiClient.get(
                `/concerts/${concertId}/ai-summary`,
            );
            return response;
        } catch (error) {
            console.error(`AI 요약 조회 실패 (ID: ${concertId}):`, error);
            throw error;
        }
    },

    // ==================== 판매자용 API ====================

    /**
     * 판매자의 콘서트 목록 조회 (관리자 전용)
     * 백엔드: GET /api/seller/concerts?sellerId={sellerId}&page=...&size=...&sortBy=...&sortDir=...
     * @param {number} sellerId - 판매자 ID
     * @param {Object} params - 페이징 및 정렬 옵션
     * @param {number} params.page - 페이지 번호 (기본값: 0)
     * @param {number} params.size - 페이지 크기 (기본값: 10)
     * @param {string} params.sortBy - 정렬 기준 (기본값: 'createdAt')
     * @param {string} params.sortDir - 정렬 방향 (기본값: 'desc')
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').PageResponse<import('../types/concert.js').SellerConcert[]>>>}
     */
    async getSellerConcerts(sellerId, params = {}) {
        try {
            // 기본값과 전달받은 파라미터를 합쳐서 쿼리 파라미터 객체 생성
            const queryParams = {
                sellerId, // 필수: 판매자 ID
                page: params.page || 0, // 페이지 번호 (0부터 시작)
                size: params.size || 10, // 한 페이지당 아이템 수
                sortBy: params.sortBy || 'createdAt', // 정렬 기준 (생성일시 기본)
                sortDir: params.sortDir || 'desc', // 정렬 방향 (내림차순 기본)
            };

            // 모든 파라미터를 쿼리스트링으로 변환해서 전송
            const response = await apiClient.get('/seller/concerts', {
                params: queryParams,
            });
            return response;
        } catch (error) {
            // 어떤 판매자의 요청에서 실패했는지 로그에 표시
            console.error(
                `판매자 콘서트 목록 조회 실패 (판매자 ID: ${sellerId}):`,
                error,
            );
            throw error;
        }
    },

    /**
     * 판매자의 특정 상태 콘서트들만 조회
     * 백엔드: GET /api/seller/concerts/status?sellerId={sellerId}&status={status}
     * @param {number} sellerId - 판매자 ID
     * @param {import('../types/concert.js').ConcertStatus} status - 콘서트 상태 (SCHEDULED, ON_SALE 등)
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').SellerConcert[]>>}
     */
    async getSellerConcertsByStatus(sellerId, status) {
        try {
            // 판매자 ID와 상태를 파라미터로 전달
            const response = await apiClient.get('/seller/concerts/status', {
                params: { sellerId, status },
            });
            return response;
        } catch (error) {
            console.error(`판매자 상태별 콘서트 조회 실패:`, error);
            throw error;
        }
    },

    /**
     * 새 콘서트 생성 (판매자 전용)
     * 백엔드: POST /api/seller/concerts?sellerId={sellerId}
     * @param {number} sellerId - 판매자 ID
     * @param {import('../types/concert.js').SellerConcertCreateData} concertData - 콘서트 생성 데이터
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').SellerConcert>>}
     */
    async createConcert(sellerId, concertData) {
        try {
            // POST 요청: 두 번째 인자는 request body, 세 번째 인자는 config
            const response = await apiClient.post(
                '/seller/concerts',
                concertData,
                {
                    params: { sellerId }, // 판매자 ID는 쿼리 파라미터로 전달
                },
            );
            return response;
        } catch (error) {
            console.error('콘서트 생성 실패:', error);
            throw error;
        }
    },

    /**
     * 기존 콘서트 정보 수정 (판매자 전용)
     * 백엔드: PUT /api/seller/concerts/{concertId}?sellerId={sellerId}
     * @param {number} sellerId - 판매자 ID
     * @param {number} concertId - 수정할 콘서트 ID
     * @param {import('../types/concert.js').SellerConcertUpdateData} updateData - 수정할 데이터 (부분 업데이트 지원)
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').SellerConcert>>}
     */
    async updateConcert(sellerId, concertId, updateData) {
        try {
            // PUT 요청으로 기존 콘서트 정보 업데이트
            const response = await apiClient.put(
                `/seller/concerts/${concertId}`,
                updateData,
                {
                    params: { sellerId }, // 권한 확인용 판매자 ID
                },
            );
            return response;
        } catch (error) {
            console.error(`콘서트 수정 실패 (ID: ${concertId}):`, error);
            throw error;
        }
    },

    /**
     * 콘서트 삭제 (실제로는 CANCELLED 상태로 변경)
     * 백엔드: DELETE /api/seller/concerts/{concertId}?sellerId={sellerId}
     * @param {number} sellerId - 판매자 ID
     * @param {number} concertId - 삭제할 콘서트 ID
     * @returns {Promise<import('../types/concert.js').ApiResponse<null>>}
     */
    async deleteConcert(sellerId, concertId) {
        try {
            // DELETE 요청: 논리적 삭제 (상태를 CANCELLED로 변경)
            const response = await apiClient.delete(
                `/seller/concerts/${concertId}`,
                {
                    params: { sellerId },
                },
            );
            return response;
        } catch (error) {
            console.error(`콘서트 삭제 실패 (ID: ${concertId}):`, error);
            throw error;
        }
    },

    /**
     * 콘서트 포스터 이미지만 업데이트
     * 백엔드: PATCH /api/seller/concerts/{concertId}/poster?sellerId={sellerId}
     * @param {number} sellerId - 판매자 ID
     * @param {number} concertId - 콘서트 ID
     * @param {string} posterImageUrl - 새 포스터 이미지 URL
     * @returns {Promise<import('../types/concert.js').ApiResponse<null>>}
     */
    async updatePosterImage(sellerId, concertId, posterImageUrl) {
        try {
            // PATCH 요청: 포스터 이미지 URL만 부분 업데이트
            const response = await apiClient.patch(
                `/seller/concerts/${concertId}/poster`,
                { posterImageUrl }, // request body: 이미지 URL 객체
                { params: { sellerId } }, // config: 판매자 ID 파라미터
            );
            return response;
        } catch (error) {
            console.error(
                `포스터 이미지 업데이트 실패 (ID: ${concertId}):`,
                error,
            );
            throw error;
        }
    },

    /**
     * 판매자가 등록한 콘서트 총 개수 조회
     * 백엔드: GET /api/seller/concerts/count?sellerId={sellerId}
     * @param {number} sellerId - 판매자 ID
     * @returns {Promise<import('../types/concert.js').ApiResponse<number>>}
     */
    async getSellerConcertCount(sellerId) {
        try {
            // 판매자의 전체 콘서트 개수 (모든 상태 포함)
            const response = await apiClient.get('/seller/concerts/count', {
                params: { sellerId },
            });
            return response;
        } catch (error) {
            console.error(
                `판매자 콘서트 개수 조회 실패 (판매자 ID: ${sellerId}):`,
                error,
            );
            throw error;
        }
    },
};
