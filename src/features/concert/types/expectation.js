// src/features/concert/types/expectation.js

/**
 * 기대평 정보 타입 (백엔드 ExpectationReviewDTO 기반)
 * @typedef {Object} ExpectationReview
 * @property {number} id - 기대평 ID
 * @property {number} concertId - 콘서트 ID (읽기 전용)
 * @property {number} userId - 작성자 사용자 ID (필수, 최소 1)
 * @property {string} userNickname - 작성자 닉네임 (필수, 최대 50자)
 * @property {string} comment - 기대평 내용 (필수, 최대 500자)
 * @property {number} expectationRating - 기대 점수 (필수, 1-5점)
 * @property {string} createdAt - 기대평 작성일시 (ISO 8601, 읽기 전용)
 * @property {string} updatedAt - 기대평 수정일시 (ISO 8601, 읽기 전용)
 */

/**
 * 기대평 작성/수정 데이터 (폼에서 사용)
 * @typedef {Object} ExpectationFormData
 * @property {string} comment - 기대평 내용 (필수, 최대 500자)
 * @property {number} expectationRating - 기대 점수 (필수, 1-5점)
 * @property {string} userNickname - 작성자 닉네임 (필수, 최대 50자)
 * @property {number} userId - 작성자 사용자 ID (필수)
 */

/**
 * 기대평 목록 조회 파라미터
 * @typedef {Object} ExpectationListParams
 * @property {number} concertId - 콘서트 ID
 * @property {number} page - 페이지 번호 (0부터 시작, 기본값 0)
 * @property {number} size - 페이지 크기 (1-100, 기본값 10)
 */

/**
 * 기대 점수 레이블 매핑
 */
export const ExpectationRatingLabels = {
    1: '별로 기대안됨',
    2: '조금 기대됨',
    3: '보통',
    4: '많이 기대됨',
    5: '정말 기대됨',
};

/**
 * 기대 점수별 이모지
 */
export const ExpectationRatingEmojis = {
    1: '😐',
    2: '🙂',
    3: '😊',
    4: '😍',
    5: '🤩',
};

/**
 * 기대 점수별 색상 (Tailwind CSS 클래스)
 */
export const ExpectationRatingColors = {
    1: 'text-gray-500',
    2: 'text-yellow-500',
    3: 'text-blue-500',
    4: 'text-purple-500',
    5: 'text-pink-500',
};

/**
 * 기대평 검증 규칙 (백엔드 validation과 동일)
 */
export const ExpectationValidation = {
    comment: {
        required: true,
        maxLength: 500,
        minLength: 1,
    },
    expectationRating: {
        required: true,
        min: 1,
        max: 5,
    },
    userNickname: {
        required: true,
        maxLength: 50,
        minLength: 1,
    },
    userId: {
        required: true,
        min: 1,
    },
};

/**
 * 기대평 기본값
 */
export const ExpectationDefaults = {
    expectationRating: 3,
    pageSize: 10,
};

/**
 * 기대평 vs 리뷰 차이점 설명 (UI에서 사용)
 */
export const ExpectationVsReviewInfo = {
    expectation: {
        title: '기대평',
        description: '콘서트 관람 전에 작성하는 기대감',
        icon: '✨',
        timing: '관람 전',
    },
    review: {
        title: '후기',
        description: '콘서트 관람 후에 작성하는 실제 후기',
        icon: '📝',
        timing: '관람 후',
    },
};
