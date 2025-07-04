// src/features/concert/services/reviewService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from '../../../shared/utils/apiClient.js';

/**
 * 리뷰 데이터 유효성 검증 함수 (모듈 레벨)
 */
const validateReviewData = (reviewData) => {
    // 🔍 디버깅: 받은 데이터 확인
    console.log('🔍 validateReviewData 받은 데이터:', reviewData);
    console.log('🔍 title 값:', reviewData.title);
    console.log('🔍 title 타입:', typeof reviewData.title);

    // 제목 검증
    if (!reviewData.title || reviewData.title.trim().length === 0) {
        console.error('❌ 제목 검증 실패 - 값:', reviewData.title);
        throw new Error('리뷰 제목은 필수입니다.');
    }
    if (reviewData.title.length > 100) {
        throw new Error('리뷰 제목은 100자 이하여야 합니다.');
    }

    // 내용 검증
    if (!reviewData.description || reviewData.description.trim().length === 0) {
        console.error('❌ 내용 검증 실패 - 값:', reviewData.description);
        throw new Error('리뷰 내용은 필수입니다.');
    }
    if (reviewData.description.length > 1000) {
        throw new Error('리뷰 내용은 1000자 이하여야 합니다.');
    }

    // 평점 검증
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        console.error('❌ 평점 검증 실패 - 값:', reviewData.rating);
        throw new Error('평점은 1 이상 5 이하여야 합니다.');
    }
    if (!Number.isInteger(reviewData.rating)) {
        throw new Error('평점은 정수여야 합니다.');
    }

    // 닉네임 검증
    if (
        !reviewData.userNickname ||
        reviewData.userNickname.trim().length === 0
    ) {
        console.error('❌ 닉네임 검증 실패 - 값:', reviewData.userNickname);
        throw new Error('작성자 닉네임은 필수입니다.');
    }
    if (reviewData.userNickname.length > 50) {
        throw new Error('작성자 닉네임은 50자 이하여야 합니다.');
    }

    // 사용자 ID 검증
    if (!reviewData.userId || reviewData.userId < 1) {
        console.error('❌ 사용자ID 검증 실패 - 값:', reviewData.userId);
        throw new Error('작성자 ID는 1 이상이어야 합니다.');
    }

    console.log('✅ 모든 검증 통과!');
};

export const reviewService = {
    async getConcertReviews(params) {
        try {
            const {
                concertId,
                page = 0,
                size = 10,
                sortBy = 'createdAt',
                sortDir = 'desc',
            } = params;

            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }

            if (page < 0) {
                throw new Error('페이지 번호는 0 이상이어야 합니다.');
            }
            if (size < 1 || size > 100) {
                throw new Error('페이지 크기는 1 이상 100 이하여야 합니다.');
            }

            const allowedSortFields = ['createdAt', 'rating', 'title'];
            if (!allowedSortFields.includes(sortBy)) {
                throw new Error(
                    `정렬 기준은 ${allowedSortFields.join(', ')} 중 하나여야 합니다.`,
                );
            }

            const allowedSortDirections = ['asc', 'desc'];
            if (!allowedSortDirections.includes(sortDir.toLowerCase())) {
                throw new Error('정렬 방향은 asc 또는 desc여야 합니다.');
            }

            const response = await apiClient.get(
                `/concerts/reviews/${concertId}`,
                {
                    params: { page, size, sortBy, sortDir },
                },
            );

            return response;
        } catch (error) {
            console.error(
                `리뷰 목록 조회 실패 (콘서트 ID: ${params.concertId}):`,
                error,
            );
            throw error;
        }
    },

    async getReviewDetail(concertId, reviewId) {
        try {
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }
            if (!reviewId || reviewId < 1) {
                throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
            }

            const response = await apiClient.get(
                `/concerts/${concertId}/reviews/${reviewId}`,
            );
            return response;
        } catch (error) {
            console.error(
                `리뷰 상세 조회 실패 (콘서트 ID: ${concertId}, 리뷰 ID: ${reviewId}):`,
                error,
            );
            throw error;
        }
    },

    async createReview(concertId, reviewData) {
        try {
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }

            // 🔍 디버깅: 생성 시 데이터 확인
            console.log('🔍 createReview 받은 데이터:', reviewData);

            validateReviewData(reviewData);

            const payload = {
                title: reviewData.title.trim(),
                description: reviewData.description.trim(),
                rating: reviewData.rating,
                userNickname: reviewData.userNickname.trim(),
                userId: reviewData.userId,
                concertId: concertId,
            };

            const response = await apiClient.post(
                `/concerts/${concertId}/reviews`,
                payload,
            );
            return response;
        } catch (error) {
            console.error(`리뷰 작성 실패 (콘서트 ID: ${concertId}):`, error);
            throw error;
        }
    },

    async updateReview(concertId, reviewId, reviewData) {
        try {
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }
            if (!reviewId || reviewId < 1) {
                throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
            }

            // 🔍 디버깅: 수정 시 데이터 확인
            console.log('🔍 updateReview 파라미터들:');
            console.log('  - concertId:', concertId);
            console.log('  - reviewId:', reviewId);
            console.log('  - reviewData:', reviewData);

            validateReviewData(reviewData);

            const payload = {
                title: reviewData.title.trim(),
                description: reviewData.description.trim(),
                rating: reviewData.rating,
                userNickname: reviewData.userNickname.trim(),
                userId: reviewData.userId,
            };

            console.log('🔍 전송할 payload:', payload);
            console.log(
                '🔍 요청 URL:',
                `/concerts/${concertId}/reviews/${reviewId}`,
            );

            const response = await apiClient.put(
                `/concerts/${concertId}/reviews/${reviewId}`,
                payload,
            );
            return response;
        } catch (error) {
            console.error(`리뷰 수정 실패 (리뷰 ID: ${reviewId}):`, error);
            throw error;
        }
    },

    async deleteReview(concertId, reviewId) {
        try {
            if (!concertId || concertId < 1) {
                throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
            }
            if (!reviewId || reviewId < 1) {
                throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
            }

            const response = await apiClient.delete(
                `/concerts/${concertId}/reviews/${reviewId}`,
            );
            return response;
        } catch (error) {
            console.error(`리뷰 삭제 실패 (리뷰 ID: ${reviewId}):`, error);
            throw error;
        }
    },
};
