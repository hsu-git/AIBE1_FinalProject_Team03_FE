// src/features/concert/services/expectationService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from '../../../shared/utils/apiClient.js';

/**
 * 기대평 관련 API 호출 서비스
 * 백엔드의 ExpectationReviewController와 1:1 매핑
 *
 * 📋 지원하는 기능:
 * - 기대평 목록 조회 (페이지네이션)
 * - 기대평 작성
 * - 기대평 수정
 * - 기대평 삭제
 *
 * 🔗 백엔드 엔드포인트:
 * - GET    /api/concerts/{concertId}/expectations
 * - POST   /api/concerts/{concertId}/expectations
 * - PUT    /api/concerts/{concertId}/expectations/{expectationId}
 * - DELETE /api/concerts/{concertId}/expectations/{expectationId}
 */

// 기대평 데이터 검증 헬퍼 함수 (모듈 레벨로 이동)
const validateExpectationData = (expectationData) => {
    const trimmedComment = expectationData.comment?.trim() || '';
    const trimmedNickname = expectationData.userNickname?.trim() || '';

    if (trimmedComment.length === 0) {
        throw new Error('기대평 내용은 필수입니다.');
    }
    if (trimmedComment.length > 500) {
        throw new Error('기대평 내용은 500자 이하여야 합니다.');
    }
    if (
        !expectationData.expectationRating ||
        expectationData.expectationRating < 1 ||
        expectationData.expectationRating > 5
    ) {
        throw new Error('기대 점수는 1 이상 5 이하여야 합니다.');
    }
    if (trimmedNickname.length === 0) {
        throw new Error('작성자 닉네임은 필수입니다.');
    }
    if (trimmedNickname.length > 50) {
        throw new Error('작성자 닉네임은 50자 이하여야 합니다.');
    }
    if (!expectationData.userId || expectationData.userId < 1) {
        throw new Error('작성자 ID는 1 이상이어야 합니다.');
    }
};

export const expectationService = {
    /**
     * 특정 콘서트의 기대평 목록을 페이지네이션으로 조회
     * 백엔드: GET /api/concerts/{concertId}/expectations?page=...&size=...
     *
     * @param {import('../types/expectation.js').ExpectationListParams} params - 조회 파라미터
     * @param {number} params.concertId - 콘서트 ID (필수, 1 이상의 양수)
     * @param {number} params.page - 페이지 번호 (0부터 시작, 기본값 0)
     * @param {number} params.size - 페이지 크기 (1-100, 기본값 10)
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').PageResponse<import('../types/expectation.js').ExpectationReview[]>>>}
     */
    async getConcertExpectations(params) {
        try {
            // params에서 concertId 추출 (URL 경로에 포함되어야 함)
            const { concertId, page = 0, size = 10 } = params;

            // concertId 유효성 검증 - 필수값이고 양수여야 함
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }

            // 페이지네이션 파라미터 유효성 검증
            if (page < 0) {
                throw new Error('페이지 번호는 0 이상이어야 합니다.');
            }
            if (size < 1 || size > 100) {
                throw new Error('페이지 크기는 1 이상 100 이하여야 합니다.');
            }

            // API 요청: URL 경로에 concertId 포함, 쿼리 파라미터로 페이징 정보 전달
            // 결과 예시: /api/concerts/123/expectations?page=0&size=10
            const response = await apiClient.get(
                `/concerts/${concertId}/expectations`,
                {
                    params: {
                        page, // 페이지 번호 (0부터 시작)
                        size, // 한 페이지당 기대평 개수
                    },
                },
            );

            // apiClient가 SuccessResponse를 자동 처리하므로 그대로 반환
            // response.data 구조: { content: [], totalElements: number, totalPages: number, ... }
            return response;
        } catch (error) {
            // 어떤 콘서트의 기대평 조회에서 실패했는지 로그에 기록
            console.error(
                `기대평 목록 조회 실패 (콘서트 ID: ${params.concertId}):`,
                error,
            );

            // 에러를 컴포넌트로 전달하여 사용자에게 적절한 에러 메시지 표시
            throw error;
        }
    },

    /**
     * 새로운 기대평 작성
     * 백엔드: POST /api/concerts/{concertId}/expectations
     *
     * @param {number} concertId - 콘서트 ID (URL 경로에 포함)
     * @param {import('../types/expectation.js').ExpectationFormData} expectationData - 작성할 기대평 데이터
     * @param {string} expectationData.comment - 기대평 내용 (필수, 최대 500자)
     * @param {number} expectationData.expectationRating - 기대 점수 (필수, 1-5점)
     * @param {string} expectationData.userNickname - 작성자 닉네임 (필수, 최대 50자)
     * @param {number} expectationData.userId - 작성자 ID (필수, 1 이상)
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/expectation.js').ExpectationReview>>}
     */
    async createExpectation(concertId, expectationData) {
        try {
            // concertId 유효성 검증
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }

            // 입력 데이터 검증
            validateExpectationData(expectationData);

            // 요청 바디 구성 - 백엔드 ExpectationReviewDTO 형식에 맞춤
            const payload = {
                comment: expectationData.comment.trim(), // 앞뒤 공백 제거
                expectationRating: expectationData.expectationRating, // 1-5 점수
                userNickname: expectationData.userNickname.trim(), // 앞뒤 공백 제거
                userId: expectationData.userId, // 작성자 ID
                concertId: concertId, // URL과 일치성 확인용
            };

            // POST 요청: 두 번째 파라미터가 request body
            const response = await apiClient.post(
                `/concerts/${concertId}/expectations`,
                payload,
            );

            // 성공 시 생성된 기대평 정보 반환
            return response;
        } catch (error) {
            console.error(`기대평 작성 실패 (콘서트 ID: ${concertId}):`, error);
            throw error;
        }
    },

    /**
     * 기존 기대평 수정
     * 백엔드: PUT /api/concerts/{concertId}/expectations/{expectationId}
     *
     * @param {number} concertId - 콘서트 ID
     * @param {number} expectationId - 수정할 기대평 ID
     * @param {import('../types/expectation.js').ExpectationFormData} expectationData - 수정할 데이터
     * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/expectation.js').ExpectationReview>>}
     */
    async updateExpectation(concertId, expectationId, expectationData) {
        try {
            // ID 파라미터 유효성 검증
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }
            if (!expectationId || expectationId < 1) {
                throw new Error('기대평 ID는 1 이상의 양수여야 합니다.');
            }

            // 수정할 데이터 유효성 검증 (생성 시와 동일한 규칙)
            validateExpectationData(expectationData);

            // 수정 요청 바디 구성
            const payload = {
                comment: expectationData.comment.trim(), // 수정된 기대평 내용
                expectationRating: expectationData.expectationRating, // 수정된 기대 점수
                userNickname: expectationData.userNickname.trim(), // 수정된 닉네임 (보통 변경되지 않음)
                userId: expectationData.userId, // 권한 확인용 사용자 ID
            };

            // PUT 요청으로 기존 기대평 전체 내용 교체
            // URL에 concertId와 expectationId 모두 포함 (백엔드 권한 확인용)
            const response = await apiClient.put(
                `/concerts/${concertId}/expectations/${expectationId}`,
                payload,
            );

            // 수정된 기대평 정보 반환
            return response;
        } catch (error) {
            console.error(
                `기대평 수정 실패 (기대평 ID: ${expectationId}):`,
                error,
            );
            throw error;
        }
    },

    /**
     * 기대평 삭제
     * 백엔드: DELETE /api/concerts/{concertId}/expectations/{expectationId}
     *
     * @param {number} concertId - 콘서트 ID
     * @param {number} expectationId - 삭제할 기대평 ID
     * @returns {Promise<import('../types/concert.js').ApiResponse<null>>}
     */
    async deleteExpectation(concertId, expectationId) {
        try {
            // ID 파라미터 유효성 검증
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }
            if (!expectationId || expectationId < 1) {
                throw new Error('기대평 ID는 1 이상의 양수여야 합니다.');
            }

            // DELETE 요청: request body 없음, URL에 필요한 ID들 포함
            // 백엔드에서 사용자 권한 확인 후 삭제 처리
            const response = await apiClient.delete(
                `/concerts/${concertId}/expectations/${expectationId}`,
            );

            // 삭제 성공 시 null 반환 (성공 메시지는 response.message에 포함)
            return response;
        } catch (error) {
            console.error(
                `기대평 삭제 실패 (기대평 ID: ${expectationId}):`,
                error,
            );
            throw error;
        }
    },
};
