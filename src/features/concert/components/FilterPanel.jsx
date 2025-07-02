// src/features/concert/components/FilterPanel.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useCallback, useEffect } from 'react';
// useState: 필터 상태 관리
// useCallback: 함수 최적화 (기본적인 수준만)
// useEffect: 초기값 설정

/**
 * ===== FilterPanel 컴포넌트 (실제 Hook 스펙에 맞춘 버전) =====
 *
 * 🎯 주요 역할:
 * 1. **날짜 필터링**: 시작일~종료일 범위 선택
 * 2. **가격 필터링**: 최소~최대 가격 범위 선택
 * 3. **간단한 필터링**: useConcerts.filterConcerts()와 연동
 * 4. **필터 초기화**: 모든 조건을 기본값으로 재설정
 * 5. **기본 유효성 검증**: 잘못된 날짜/가격 범위 방지
 *
 * 🔄 사용 방법:
 * - useConcerts hook의 filterConcerts 함수와 연동
 * - 단순한 필터 적용 (디바운싱 없음)
 * - 버튼 클릭 시에만 필터 적용
 *
 * 💡 실제 hook 연동:
 * const { filterConcerts, loading } = useConcerts();
 * <FilterPanel onFilter={filterConcerts} loading={loading} />
 */
const FilterPanel = ({
    // ===== 필수 props =====
    onFilter, // 필터 적용 함수 (useConcerts.filterConcerts)

    // ===== 초기값 props =====
    initialFilters = {}, // 초기 필터 값

    // ===== UI 제어 props =====
    loading = false, // 필터링 중인지 여부 (useConcerts.loading)
    disabled = false, // 전체 비활성화

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (좁은 공간용)
}) => {
    // ===== 상태 관리 섹션 =====

    /**
     * 날짜 필터 상태 (YYYY-MM-DD 형식)
     * 백엔드 ConcertFilterDTO.startDate, endDate와 매핑
     */
    const [startDate, setStartDate] = useState(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters.endDate || '');

    /**
     * 가격 필터 상태 (숫자)
     * 백엔드 ConcertFilterDTO.priceMin, priceMax와 매핑
     */
    const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
    const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');

    /**
     * 간단한 에러 상태
     * 복잡한 검증 로직 대신 기본적인 에러만 추적
     */
    const [error, setError] = useState('');

    /**
     * 필터 변경 여부 추적
     * 초기화 버튼 활성화용
     */
    const [hasChanges, setHasChanges] = useState(false);

    // ===== 기본 유효성 검증 함수들 =====

    /**
     * 날짜 범위 검증 (간단 버전)
     * 시작일이 종료일보다 늦으면 안됨
     */
    const isValidDateRange = useCallback(() => {
        if (!startDate || !endDate) return true; // 둘 중 하나라도 없으면 OK
        return new Date(startDate) <= new Date(endDate);
    }, [startDate, endDate]);

    /**
     * 가격 범위 검증 (간단 버전)
     * 최소가격이 최대가격보다 크면 안됨
     */
    const isValidPriceRange = useCallback(() => {
        if (!priceMin || !priceMax) return true; // 둘 중 하나라도 없으면 OK
        return parseFloat(priceMin) <= parseFloat(priceMax);
    }, [priceMin, priceMax]);

    /**
     * 전체 필터 유효성 검증
     * 기본적인 검증만 수행
     */
    const validateFilters = useCallback(() => {
        setError(''); // 에러 초기화

        // 날짜 범위 검증
        if (!isValidDateRange()) {
            setError('종료일은 시작일과 같거나 늦어야 합니다.');
            return false;
        }

        // 가격 범위 검증
        if (!isValidPriceRange()) {
            setError('최대 가격은 최소 가격보다 크거나 같아야 합니다.');
            return false;
        }

        // 가격 형식 검증 (숫자인지 확인)
        if (
            priceMin &&
            (isNaN(parseFloat(priceMin)) || parseFloat(priceMin) < 0)
        ) {
            setError('최소 가격은 0 이상의 숫자여야 합니다.');
            return false;
        }

        if (
            priceMax &&
            (isNaN(parseFloat(priceMax)) || parseFloat(priceMax) < 0)
        ) {
            setError('최대 가격은 0 이상의 숫자여야 합니다.');
            return false;
        }

        return true;
    }, [isValidDateRange, isValidPriceRange, priceMin, priceMax]);

    // ===== 필터 데이터 변환 함수 =====

    /**
     * 현재 필터 상태를 백엔드 API 형식으로 변환
     * ConcertFilterDTO 형식에 맞춤
     */
    const getCurrentFilters = useCallback(() => {
        const filters = {};

        // 날짜 필터 (값이 있을 때만 추가)
        if (startDate.trim()) {
            filters.startDate = startDate.trim();
        }
        if (endDate.trim()) {
            filters.endDate = endDate.trim();
        }

        // 가격 필터 (값이 있고 유효한 숫자일 때만 추가)
        if (priceMin.trim() && !isNaN(parseFloat(priceMin))) {
            filters.priceMin = parseFloat(priceMin);
        }
        if (priceMax.trim() && !isNaN(parseFloat(priceMax))) {
            filters.priceMax = parseFloat(priceMax);
        }

        return filters;
    }, [startDate, endDate, priceMin, priceMax]);

    // ===== 이벤트 핸들러들 =====

    /**
     * 필터 적용 핸들러
     * useConcerts.filterConcerts() 호출
     */
    const handleApplyFilter = useCallback(async () => {
        // 로딩 중이거나 비활성화 상태면 실행하지 않음
        if (loading || disabled) {
            return;
        }

        // 유효성 검증
        if (!validateFilters()) {
            return; // 검증 실패 시 함수 종료 (에러 메시지는 이미 설정됨)
        }

        // 현재 필터 값들을 API 형식으로 변환
        const filterParams = getCurrentFilters();

        try {
            // useConcerts.filterConcerts() 호출
            if (onFilter && typeof onFilter === 'function') {
                await onFilter(filterParams);
                console.info('필터 적용 완료:', filterParams);
            }
        } catch (err) {
            // 필터링 실패 시 에러 메시지 설정
            setError('필터링 중 오류가 발생했습니다.');
            console.error('필터링 실패:', err);
        }
    }, [loading, disabled, validateFilters, getCurrentFilters, onFilter]);

    /**
     * 필터 초기화 핸들러
     */
    const handleResetFilter = useCallback(() => {
        // 상태 초기화
        setStartDate(initialFilters.startDate || '');
        setEndDate(initialFilters.endDate || '');
        setPriceMin(initialFilters.priceMin || '');
        setPriceMax(initialFilters.priceMax || '');
        setError('');
        setHasChanges(false);

        console.info('필터가 초기화되었습니다.');
    }, [initialFilters]);

    /**
     * 시작일 변경 핸들러
     */
    const handleStartDateChange = useCallback((event) => {
        setStartDate(event.target.value);
        setHasChanges(true);
        setError(''); // 입력 시 에러 메시지 제거
    }, []);

    /**
     * 종료일 변경 핸들러
     */
    const handleEndDateChange = useCallback((event) => {
        setEndDate(event.target.value);
        setHasChanges(true);
        setError(''); // 입력 시 에러 메시지 제거
    }, []);

    /**
     * 최소 가격 변경 핸들러
     */
    const handlePriceMinChange = useCallback((event) => {
        const value = event.target.value;
        // 숫자와 소수점만 허용
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPriceMin(value);
            setHasChanges(true);
            setError(''); // 입력 시 에러 메시지 제거
        }
    }, []);

    /**
     * 최대 가격 변경 핸들러
     */
    const handlePriceMaxChange = useCallback((event) => {
        const value = event.target.value;
        // 숫자와 소수점만 허용
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPriceMax(value);
            setHasChanges(true);
            setError(''); // 입력 시 에러 메시지 제거
        }
    }, []);

    // ===== 부수 효과(Side Effect) =====

    /**
     * 초기값 변경 시 상태 동기화
     */
    useEffect(() => {
        setStartDate(initialFilters.startDate || '');
        setEndDate(initialFilters.endDate || '');
        setPriceMin(initialFilters.priceMin || '');
        setPriceMax(initialFilters.priceMax || '');
        setHasChanges(false);
        setError('');
    }, [initialFilters]);

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        padding: compact ? '12px' : '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        opacity: disabled ? 0.6 : 1,
    };

    /**
     * 섹션 스타일
     */
    const sectionStyles = {
        marginBottom: compact ? '12px' : '16px',
    };

    /**
     * 라벨 스타일
     */
    const labelStyles = {
        display: 'block',
        fontSize: compact ? '13px' : '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px',
    };

    /**
     * 입력 필드 스타일
     */
    const inputStyles = {
        width: '100%',
        padding: compact ? '6px 8px' : '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: compact ? '13px' : '14px',
        backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
        color: disabled ? '#9ca3af' : '#1f2937',
    };

    /**
     * 에러 메시지 스타일
     */
    const errorStyles = {
        fontSize: '12px',
        color: '#ef4444',
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#fef2f2',
        borderRadius: '4px',
        border: '1px solid #fecaca',
    };

    /**
     * 버튼 기본 스타일
     */
    const buttonBaseStyles = {
        padding: compact ? '6px 12px' : '8px 16px',
        borderRadius: '4px',
        fontSize: compact ? '13px' : '14px',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        opacity: disabled || loading ? 0.6 : 1,
    };

    /**
     * 적용 버튼 스타일
     */
    const applyButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        marginRight: '8px',
    };

    /**
     * 초기화 버튼 스타일
     */
    const resetButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#6b7280',
        color: '#ffffff',
    };

    // ===== JSX 렌더링 =====

    return (
        <div
            className={`filter-panel ${className}`}
            style={containerStyles}
            role="search"
            aria-label="콘서트 필터링"
        >
            {/* 📅 날짜 필터 섹션 */}
            <div style={sectionStyles}>
                <h3
                    style={{
                        ...labelStyles,
                        fontSize: compact ? '14px' : '16px',
                        marginBottom: compact ? '8px' : '12px',
                        color: '#1f2937',
                    }}
                >
                    📅 공연 날짜
                </h3>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '8px',
                        alignItems: 'end',
                    }}
                >
                    {/* 시작일 */}
                    <div>
                        <label htmlFor="startDate" style={labelStyles}>
                            시작일
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            disabled={disabled}
                            style={inputStyles}
                        />
                    </div>

                    {/* 구분선 */}
                    <div
                        style={{
                            color: '#6b7280',
                            fontSize: compact ? '14px' : '16px',
                            paddingBottom: '8px',
                        }}
                    >
                        ~
                    </div>

                    {/* 종료일 */}
                    <div>
                        <label htmlFor="endDate" style={labelStyles}>
                            종료일
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            disabled={disabled}
                            style={inputStyles}
                        />
                    </div>
                </div>
            </div>

            {/* 💰 가격 필터 섹션 */}
            <div style={sectionStyles}>
                <h3
                    style={{
                        ...labelStyles,
                        fontSize: compact ? '14px' : '16px',
                        marginBottom: compact ? '8px' : '12px',
                        color: '#1f2937',
                    }}
                >
                    💰 가격 범위 (원)
                </h3>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '8px',
                        alignItems: 'end',
                    }}
                >
                    {/* 최소 가격 */}
                    <div>
                        <label htmlFor="priceMin" style={labelStyles}>
                            최소 가격
                        </label>
                        <input
                            id="priceMin"
                            type="text"
                            value={priceMin}
                            onChange={handlePriceMinChange}
                            disabled={disabled}
                            placeholder="0"
                            style={inputStyles}
                        />
                    </div>

                    {/* 구분선 */}
                    <div
                        style={{
                            color: '#6b7280',
                            fontSize: compact ? '14px' : '16px',
                            paddingBottom: '8px',
                        }}
                    >
                        ~
                    </div>

                    {/* 최대 가격 */}
                    <div>
                        <label htmlFor="priceMax" style={labelStyles}>
                            최대 가격
                        </label>
                        <input
                            id="priceMax"
                            type="text"
                            value={priceMax}
                            onChange={handlePriceMaxChange}
                            disabled={disabled}
                            placeholder="무제한"
                            style={inputStyles}
                        />
                    </div>
                </div>
            </div>

            {/* ⚠️ 에러 메시지 */}
            {error && <div style={errorStyles}>⚠️ {error}</div>}

            {/* 🔧 버튼 영역 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: compact ? '12px' : '16px',
                }}
            >
                {/* 초기화 버튼 */}
                <button
                    type="button"
                    onClick={handleResetFilter}
                    disabled={disabled || !hasChanges}
                    style={{
                        ...resetButtonStyles,
                        opacity: !hasChanges || disabled ? 0.4 : 1,
                    }}
                    aria-label="필터 초기화"
                >
                    {hasChanges ? '🔄 초기화' : '⚪ 초기화'}
                </button>

                {/* 적용 버튼 */}
                <button
                    type="button"
                    onClick={handleApplyFilter}
                    disabled={disabled || loading}
                    style={applyButtonStyles}
                    aria-label="필터 적용"
                >
                    {loading ? '⏳ 적용 중...' : '🔍 필터 적용'}
                </button>
            </div>

            {/* 💡 도움말 (컴팩트가 아닐 때만) */}
            {!compact && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#6b7280',
                    }}
                >
                    💡 팁: 날짜와 가격을 설정한 후 "필터 적용" 버튼을
                    눌러주세요.
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
FilterPanel.defaultProps = {
    initialFilters: {},
    loading: false,
    disabled: false,
    className: '',
    compact: false,
};

export default FilterPanel;
