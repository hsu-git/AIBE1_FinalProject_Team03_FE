// src/features/concert/components/ReviewForm.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useCallback, useEffect } from 'react';
// useState: 폼 상태 관리
// useCallback: 이벤트 핸들러 최적화
// useEffect: 초기값 설정 및 수정 모드 처리

// 리뷰 관련 타입과 상수들을 import
import {
    RatingLabels,
    RatingEmojis,
    ReviewValidation,
} from '../types/review.js';

/**
 * ===== ReviewForm 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **리뷰 작성**: 새로운 콘서트 후기 작성 폼
 * 2. **리뷰 수정**: 기존 리뷰 내용 수정 폼
 * 3. **유효성 검증**: 실시간 입력 검증 및 에러 표시
 * 4. **별점 입력**: 인터랙티브한 별점 선택 UI
 * 5. **글자 수 카운터**: 제목/내용 글자 수 실시간 표시
 *
 * 🔄 Hook 연동:
 * - useReviews.createReview (새 리뷰 작성)
 * - useReviews.updateReview (기존 리뷰 수정)
 * - useReviews.actionLoading (작업 중 상태)
 *
 * 💡 사용 방법:
 * // 새 리뷰 작성
 * <ReviewForm
 *   mode="create"
 *   onSubmit={createReview}
 *   loading={actionLoading}
 * />
 *
 * // 기존 리뷰 수정
 * <ReviewForm
 *   mode="edit"
 *   initialData={existingReview}
 *   onSubmit={updateReview}
 * />
 */
const ReviewForm = ({
    // ===== 모드 props =====
    mode = 'create', // 'create' | 'edit' - 작성/수정 모드
    initialData = null, // 수정 모드일 때 기존 리뷰 데이터

    // ===== 필수 데이터 props =====
    concertId, // 콘서트 ID (필수)
    userId, // 작성자 사용자 ID (필수)
    userNickname, // 작성자 닉네임 (필수)

    // ===== 액션 props =====
    onSubmit, // 폼 제출 핸들러 (useReviews.createReview or updateReview)
    onCancel, // 취소 버튼 핸들러 (선택사항)

    // ===== 상태 props =====
    loading = false, // 제출 중 로딩 상태 (useReviews.actionLoading)
    disabled = false, // 폼 비활성화

    // ===== UI 제어 props =====
    showCancelButton = true, // 취소 버튼 표시 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드
}) => {
    // ===== 상태 관리 =====

    /**
     * 폼 데이터 상태 (ReviewFormData 형식)
     */
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        rating: initialData?.rating || 5,
        userNickname: initialData?.userNickname || userNickname || '',
        userId: initialData?.userId || userId || null,
    });

    /**
     * 유효성 검증 에러 상태
     */
    const [errors, setErrors] = useState({
        title: '',
        description: '',
        rating: '',
        userNickname: '',
        userId: '',
    });

    /**
     * 폼 터치 상태 (사용자가 입력한 필드 추적)
     */
    const [touched, setTouched] = useState({
        title: false,
        description: false,
        rating: false,
        userNickname: false,
    });

    /**
     * 별점 호버 상태 (마우스 오버된 별점)
     */
    const [hoveredRating, setHoveredRating] = useState(0);

    // ===== 유효성 검증 함수들 =====

    /**
     * 개별 필드 유효성 검증
     */
    const validateField = useCallback((fieldName, value) => {
        const validation = ReviewValidation[fieldName];
        if (!validation) return '';

        // 필수 필드 검증
        if (
            validation.required &&
            (!value || value.toString().trim().length === 0)
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) 필수입니다.`;
        }

        // 길이 검증
        if (
            value &&
            validation.maxLength &&
            value.length > validation.maxLength
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) ${validation.maxLength}자 이하여야 합니다.`;
        }

        if (
            value &&
            validation.minLength &&
            value.length < validation.minLength
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) ${validation.minLength}자 이상이어야 합니다.`;
        }

        // 숫자 범위 검증 (평점)
        if (fieldName === 'rating') {
            const numValue = Number(value);
            if (validation.min && numValue < validation.min) {
                return `평점은 ${validation.min}점 이상이어야 합니다.`;
            }
            if (validation.max && numValue > validation.max) {
                return `평점은 ${validation.max}점 이하여야 합니다.`;
            }
        }

        return '';
    }, []);

    /**
     * 전체 폼 유효성 검증
     */
    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        // 모든 필드에 대해 검증 수행
        Object.keys(formData).forEach((fieldName) => {
            const error = validateField(fieldName, formData[fieldName]);
            newErrors[fieldName] = error;
            if (error) isValid = false;
        });

        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    /**
     * 필드 표시명 반환
     */
    const getFieldDisplayName = useCallback((fieldName) => {
        const displayNames = {
            title: '리뷰 제목',
            description: '리뷰 내용',
            rating: '평점',
            userNickname: '닉네임',
            userId: '사용자 ID',
        };
        return displayNames[fieldName] || fieldName;
    }, []);

    // ===== 이벤트 핸들러들 =====

    /**
     * 텍스트 입력 필드 변경 핸들러
     */
    const handleInputChange = useCallback(
        (fieldName) => {
            return (event) => {
                const value = event.target.value;

                // 폼 데이터 업데이트
                setFormData((prev) => ({
                    ...prev,
                    [fieldName]: value,
                }));

                // 터치 상태 업데이트
                setTouched((prev) => ({
                    ...prev,
                    [fieldName]: true,
                }));

                // 실시간 유효성 검증 (터치된 필드만)
                if (touched[fieldName]) {
                    const error = validateField(fieldName, value);
                    setErrors((prev) => ({
                        ...prev,
                        [fieldName]: error,
                    }));
                }
            };
        },
        [touched, validateField],
    );

    /**
     * 별점 클릭 핸들러
     */
    const handleRatingClick = useCallback(
        (rating) => {
            setFormData((prev) => ({
                ...prev,
                rating,
            }));

            setTouched((prev) => ({
                ...prev,
                rating: true,
            }));

            // 별점 유효성 검증
            const error = validateField('rating', rating);
            setErrors((prev) => ({
                ...prev,
                rating: error,
            }));
        },
        [validateField],
    );

    /**
     * 별점 호버 핸들러
     */
    const handleRatingHover = useCallback((rating) => {
        setHoveredRating(rating);
    }, []);

    /**
     * 별점 호버 해제 핸들러
     */
    const handleRatingLeave = useCallback(() => {
        setHoveredRating(0);
    }, []);

    /**
     * 폼 제출 핸들러
     */
    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();

            // 모든 필드를 터치 상태로 설정 (에러 표시용)
            setTouched({
                title: true,
                description: true,
                rating: true,
                userNickname: true,
            });

            // 전체 폼 유효성 검증
            if (!validateForm()) {
                return;
            }

            // 비활성화 상태이거나 로딩 중이면 제출하지 않음
            if (disabled || loading) {
                return;
            }

            try {
                // 부모 컴포넌트의 제출 함수 호출
                if (onSubmit && typeof onSubmit === 'function') {
                    if (mode === 'edit' && initialData?.id) {
                        // 수정 모드: reviewId와 함께 전달
                        await onSubmit(initialData.id, formData);
                    } else {
                        // 작성 모드: 폼 데이터만 전달
                        await onSubmit(formData);
                    }
                }
            } catch (error) {
                // 에러는 상위 컴포넌트에서 처리
                console.error('리뷰 제출 실패:', error);
            }
        },
        [
            formData,
            disabled,
            loading,
            validateForm,
            onSubmit,
            mode,
            initialData,
        ],
    );

    /**
     * 취소 버튼 핸들러
     */
    const handleCancel = useCallback(() => {
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    }, [onCancel]);

    // ===== 부수 효과 =====

    /**
     * 초기 데이터 변경 시 폼 상태 동기화
     */
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                rating: initialData.rating || 5,
                userNickname: initialData.userNickname || userNickname || '',
                userId: initialData.userId || userId || null,
            });
        }
    }, [initialData, userNickname, userId]);

    /**
     * 외부 props 변경 시 폼 데이터 업데이트
     */
    useEffect(() => {
        if (!initialData) {
            setFormData((prev) => ({
                ...prev,
                userNickname: userNickname || prev.userNickname,
                userId: userId || prev.userId,
            }));
        }
    }, [userNickname, userId, initialData]);

    // ===== 유틸리티 함수들 =====

    /**
     * 글자 수 표시 함수
     */
    const getCharacterCount = useCallback((text, maxLength) => {
        const currentLength = text ? text.length : 0;
        return `${currentLength}/${maxLength}`;
    }, []);

    /**
     * 글자 수 색상 결정 함수
     */
    const getCharacterCountColor = useCallback((text, maxLength) => {
        const currentLength = text ? text.length : 0;
        const percentage = currentLength / maxLength;

        if (percentage >= 1) return '#dc2626'; // 빨간색 (초과)
        if (percentage >= 0.9) return '#f59e0b'; // 주황색 (90% 이상)
        if (percentage >= 0.7) return '#10b981'; // 초록색 (70% 이상)
        return '#6b7280'; // 회색 (일반)
    }, []);

    /**
     * 별점 표시용 별 렌더링
     */
    const renderStars = useCallback(() => {
        const stars = [];
        const displayRating = hoveredRating || formData.rating;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingClick(i)}
                    onMouseEnter={() => handleRatingHover(i)}
                    onMouseLeave={handleRatingLeave}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: compact ? '24px' : '32px',
                        color: i <= displayRating ? '#fbbf24' : '#e5e7eb',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'color 0.2s ease',
                        padding: '4px',
                    }}
                    disabled={disabled}
                    aria-label={`${i}점`}
                >
                    ★
                </button>,
            );
        }

        return stars;
    }, [
        hoveredRating,
        formData.rating,
        compact,
        disabled,
        handleRatingClick,
        handleRatingHover,
        handleRatingLeave,
    ]);

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: compact ? '16px' : '24px',
        maxWidth: '600px',
        margin: '0 auto',
    };

    /**
     * 제목 스타일
     */
    const titleStyles = {
        fontSize: compact ? '18px' : '20px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: compact ? '16px' : '20px',
        textAlign: 'center',
    };

    /**
     * 폼 그룹 스타일
     */
    const formGroupStyles = {
        marginBottom: compact ? '16px' : '20px',
    };

    /**
     * 라벨 스타일
     */
    const labelStyles = {
        display: 'block',
        fontSize: compact ? '14px' : '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px',
    };

    /**
     * 입력 필드 기본 스타일
     */
    const inputBaseStyles = {
        width: '100%',
        padding: compact ? '8px 12px' : '12px 16px',
        border: '2px solid #d1d5db',
        borderRadius: '6px',
        fontSize: compact ? '14px' : '16px',
        backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
        color: disabled ? '#9ca3af' : '#1f2937',
        transition: 'border-color 0.2s ease',
    };

    /**
     * 에러 상태 입력 필드 스타일
     */
    const getInputStyles = (fieldName) => {
        const hasError = touched[fieldName] && errors[fieldName];
        return {
            ...inputBaseStyles,
            borderColor: hasError ? '#ef4444' : '#d1d5db',
        };
    };

    /**
     * 텍스트영역 스타일
     */
    const textareaStyles = {
        ...getInputStyles('description'),
        minHeight: compact ? '80px' : '120px',
        resize: 'vertical',
    };

    /**
     * 에러 메시지 스타일
     */
    const errorStyles = {
        fontSize: '12px',
        color: '#ef4444',
        marginTop: '4px',
    };

    /**
     * 글자 수 카운터 스타일
     */
    const getCounterStyles = (fieldName, maxLength) => ({
        fontSize: '12px',
        color: getCharacterCountColor(formData[fieldName], maxLength),
        textAlign: 'right',
        marginTop: '4px',
    });

    /**
     * 별점 섹션 스타일
     */
    const ratingContainerStyles = {
        textAlign: 'center',
        padding: compact ? '12px' : '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
    };

    /**
     * 별점 라벨 스타일
     */
    const ratingLabelStyles = {
        fontSize: compact ? '14px' : '16px',
        color: '#1e40af',
        marginTop: '8px',
        fontWeight: '600',
    };

    /**
     * 버튼 기본 스타일
     */
    const buttonBaseStyles = {
        padding: compact ? '8px 16px' : '12px 24px',
        borderRadius: '6px',
        fontSize: compact ? '14px' : '16px',
        fontWeight: '600',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
    };

    /**
     * 제출 버튼 스타일
     */
    const submitButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
        color: '#ffffff',
        marginRight: '12px',
    };

    /**
     * 취소 버튼 스타일
     */
    const cancelButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: 'transparent',
        color: '#6b7280',
        border: '1px solid #d1d5db',
    };

    // ===== JSX 렌더링 =====

    return (
        <div className={`review-form ${className}`} style={containerStyles}>
            {/* 폼 제목 */}
            <h2 style={titleStyles}>
                {mode === 'edit' ? '📝 리뷰 수정' : '✍️ 리뷰 작성'}
            </h2>

            <form onSubmit={handleSubmit}>
                {/* 제목 입력 */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-title" style={labelStyles}>
                        리뷰 제목 *
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange('title')}
                        disabled={disabled}
                        placeholder="리뷰 제목을 입력해주세요"
                        style={getInputStyles('title')}
                        maxLength={ReviewValidation.title.maxLength}
                    />
                    {touched.title && errors.title && (
                        <div style={errorStyles}>{errors.title}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'title',
                            ReviewValidation.title.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.title,
                            ReviewValidation.title.maxLength,
                        )}
                    </div>
                </div>

                {/* 별점 입력 */}
                <div style={formGroupStyles}>
                    <label style={labelStyles}>평점 *</label>
                    <div style={ratingContainerStyles}>
                        <div style={{ marginBottom: '8px' }}>
                            {renderStars()}
                        </div>
                        <div style={ratingLabelStyles}>
                            {RatingEmojis[hoveredRating || formData.rating]}{' '}
                            {RatingLabels[hoveredRating || formData.rating]} (
                            {hoveredRating || formData.rating}/5)
                        </div>
                    </div>
                    {touched.rating && errors.rating && (
                        <div style={errorStyles}>{errors.rating}</div>
                    )}
                </div>

                {/* 내용 입력 */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-description" style={labelStyles}>
                        리뷰 내용 *
                    </label>
                    <textarea
                        id="review-description"
                        value={formData.description}
                        onChange={handleInputChange('description')}
                        disabled={disabled}
                        placeholder="콘서트 관람 후기를 자세히 작성해주세요"
                        style={textareaStyles}
                        maxLength={ReviewValidation.description.maxLength}
                    />
                    {touched.description && errors.description && (
                        <div style={errorStyles}>{errors.description}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'description',
                            ReviewValidation.description.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.description,
                            ReviewValidation.description.maxLength,
                        )}
                    </div>
                </div>

                {/* 닉네임 입력 (수정 가능) */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-nickname" style={labelStyles}>
                        닉네임 *
                    </label>
                    <input
                        id="review-nickname"
                        type="text"
                        value={formData.userNickname}
                        onChange={handleInputChange('userNickname')}
                        disabled={disabled}
                        placeholder="닉네임을 입력해주세요"
                        style={getInputStyles('userNickname')}
                        maxLength={ReviewValidation.userNickname.maxLength}
                    />
                    {touched.userNickname && errors.userNickname && (
                        <div style={errorStyles}>{errors.userNickname}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'userNickname',
                            ReviewValidation.userNickname.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.userNickname,
                            ReviewValidation.userNickname.maxLength,
                        )}
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: compact ? '20px' : '24px',
                    }}
                >
                    <button
                        type="submit"
                        disabled={disabled || loading}
                        style={submitButtonStyles}
                    >
                        {loading ? (
                            <>
                                ⏳{' '}
                                {mode === 'edit' ? '수정 중...' : '작성 중...'}
                            </>
                        ) : (
                            <>
                                {mode === 'edit'
                                    ? '✅ 수정 완료'
                                    : '📝 리뷰 작성'}
                            </>
                        )}
                    </button>

                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={cancelButtonStyles}
                        >
                            ❌ 취소
                        </button>
                    )}
                </div>
            </form>

            {/* 안내 메시지 */}
            {!compact && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#1e40af',
                    }}
                >
                    💡 작성하신 리뷰는 다른 관람객들에게 큰 도움이 됩니다.
                    정직하고 자세한 후기를 작성해주세요!
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ReviewForm.defaultProps = {
    mode: 'create',
    initialData: null,
    loading: false,
    disabled: false,
    showCancelButton: true,
    className: '',
    compact: false,
};

export default ReviewForm;
