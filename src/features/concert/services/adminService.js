// src/features/concert/services/adminService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from '../../../shared/utils/apiClient.js';

/**
 * 관리자 관련 API 호출 서비스
 * 백엔드의 AdminAiController와 1:1 매핑
 *
 * 📋 지원하는 기능:
 * - AI 요약 수동 재생성
 *
 * 🔗 백엔드 엔드포인트:
 * - POST /api/admin/ai/concerts/{concertId}/summary/regenerate
 *
 * 🔒 권한:
 * - 관리자 전용 API
 * - 적절한 인증/권한 검사 필요
 */
export const adminService = {
    /**
     * 콘서트 AI 요약 수동 재생성
     * 백엔드: POST /api/admin/ai/concerts/{concertId}/summary/regenerate
     *
     * 📋 동작 조건:
     * - 배치 처리와 동일한 조건 적용 (10자 이상 리뷰만 유효)
     * - 조건 미충족 시 명확한 에러 메시지 제공
     *
     * ⚠️ 주의사항:
     * - 리뷰가 부족하거나 조건을 만족하지 않으면 실패
     * - AI 서비스 장애 시 재시도가 필요할 수 있음
     * - 관리자 권한 필요
     *
     * @param {number} concertId - 콘서트 ID (필수, 1 이상의 양수)
     * @returns {Promise<import('../types/concert.js').ApiResponse<string>>} 생성된 AI 요약 텍스트
     */
    async regenerateAiSummary(concertId) {
        try {
            // concertId 유효성 검증 - 필수값이고 양수여야 함
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }

            // 관리자 로그 기록 - 중요한 작업이므로 상세히 로깅
            console.info(
                `[ADMIN] AI 요약 수동 재생성 시작 - 콘서트 ID: ${concertId}`,
            );

            // API 요청: POST 요청이지만 request body는 없음 (concertId만 URL에 포함)
            // 결과 예시: POST /api/admin/ai/concerts/123/summary/regenerate
            const response = await apiClient.post(
                `/admin/ai/concerts/${concertId}/summary/regenerate`,
            );

            // 성공 시 생성된 AI 요약 텍스트 로깅 (처음 100자만)
            const summaryPreview =
                response.data?.length > 100
                    ? response.data.substring(0, 100) + '...'
                    : response.data;
            console.info(
                `[ADMIN] AI 요약 재생성 성공 - 콘서트 ID: ${concertId}, 요약 미리보기: "${summaryPreview}"`,
            );

            // apiClient가 SuccessResponse를 자동 처리하므로 그대로 반환
            // response.data: 생성된 AI 요약 텍스트 (string)
            return response;
        } catch (error) {
            // 관리자 작업 실패는 중요하므로 ERROR 레벨로 로깅
            console.error(
                `[ADMIN] AI 요약 재생성 실패 - 콘서트 ID: ${concertId}:`,
                error,
            );

            // 백엔드에서 반환하는 구체적인 에러 메시지 확인
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                // 백엔드에서 제공하는 사용자 친화적 메시지 사용
                const backendMessage = error.response.data.message;
                console.warn(`[ADMIN] 백엔드 에러 메시지: ${backendMessage}`);

                // 백엔드 메시지를 그대로 사용 (이미 사용자 친화적으로 변환됨)
                throw new Error(backendMessage);
            }

            // 네트워크 오류나 기타 예상치 못한 에러
            if (
                error.code === 'NETWORK_ERROR' ||
                error.code === 'ECONNREFUSED'
            ) {
                throw new Error(
                    '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
                );
            }

            // HTTP 상태 코드별 처리
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        throw new Error(
                            '잘못된 요청입니다. 콘서트 ID를 확인해주세요.',
                        );
                    case 401:
                        throw new Error(
                            '인증이 필요합니다. 다시 로그인해주세요.',
                        );
                    case 403:
                        throw new Error('관리자 권한이 필요합니다.');
                    case 404:
                        throw new Error('해당 콘서트를 찾을 수 없습니다.');
                    case 500:
                        throw new Error(
                            '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                        );
                    default:
                        throw new Error(
                            `알 수 없는 오류가 발생했습니다. (상태 코드: ${status})`,
                        );
                }
            }

            // 기타 예상치 못한 에러
            throw new Error(
                'AI 요약 재생성 중 예상치 못한 오류가 발생했습니다.',
            );
        }
    },
};
