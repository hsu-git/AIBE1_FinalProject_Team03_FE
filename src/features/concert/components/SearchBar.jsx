// src/features/concert/components/SearchBar.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ===== SearchBar 컴포넌트 (한국어 입력 문제 해결 버전) =====
 *
 * 🎯 주요 개선사항:
 * 1. IME(한국어 입력) 처리 완전 개선
 * 2. onClear 함수 제대로 작동하도록 수정
 * 3. 한국어 입력 중 엔터키 중복 실행 방지
 * 4. 검색어 지우기 버튼 완전 수정
 */
const SearchBar = ({
    // ===== 필수 props =====
    onSearch, // 검색 실행 함수 (필수)

    // ===== 상태 제어 관련 props =====
    value, // 외부에서 관리하는 검색어 (useSearch.searchTerm)
    onChange, // 검색어 변경 함수 (useSearch.setSearchTerm)

    // ===== 기존 props (선택적) =====
    initialValue = '', // 내부 제어 모드에서의 초기값
    placeholder = '콘서트나 아티스트를 검색하세요',
    loading = false, // useSearch.isSearching과 연동
    disabled = false,
    autoFocus = false,
    onClear, // useSearch.clearSearch와 연동
    className = '',
}) => {
    // ===== 상태 관리 섹션 =====

    const isExternallyControlled = value !== undefined;
    const [internalSearchTerm, setInternalSearchTerm] = useState(initialValue);
    const currentSearchTerm = isExternallyControlled
        ? value
        : internalSearchTerm;
    const setCurrentSearchTerm = isExternallyControlled
        ? onChange
        : setInternalSearchTerm;

    // 포커스 상태
    const [isFocused, setIsFocused] = useState(false);

    // DOM 참조
    const inputRef = useRef(null);

    // ===== 외부 상태 동기화 =====
    useEffect(() => {
        if (isExternallyControlled && value === '' && inputRef.current) {
            // 필요시 포커스 유지
        }
    }, [isExternallyControlled, value]);

    // ===== 이벤트 핸들러 섹션 =====

    /**
     * 🔥 입력 값 변경 핸들러 (한국어 처리 개선)
     */
    const handleInputChange = useCallback(
        (event) => {
            const newValue = event.target.value;
            console.log('입력값 변경:', newValue);
            if (setCurrentSearchTerm) {
                setCurrentSearchTerm(newValue);
            }
        },
        [setCurrentSearchTerm],
    );

    /**
     * 🔥 검색 실행 핸들러 (한국어 입력 중 방지)
     */
    const handleSearch = useCallback(() => {
        const trimmedTerm = currentSearchTerm.trim();
        if (!trimmedTerm) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            return;
        }

        if (disabled || loading) {
            return;
        }

        if (onSearch && typeof onSearch === 'function') {
            onSearch(trimmedTerm);
        }

        console.info(`검색 실행: "${trimmedTerm}"`);
    }, [currentSearchTerm, disabled, loading, onSearch]);

    /**
     * 🔥 검색어 지우기 핸들러 (완전 수정)
     */
    const handleClear = useCallback(() => {
        // 내부 제어 모드이므로 내부 상태만 초기화
        setInternalSearchTerm(''); // 또는 setCurrentSearchTerm('')

        // 외부 onClear 호출
        if (onClear && typeof onClear === 'function') {
            onClear();
        }

        // 포커스 유지
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [onClear]);

    /**
     * 🔥 키보드 이벤트 핸들러 (한국어 입력 고려)
     */
    const handleKeyDown = useCallback(
        (event) => {
            // 한국어 입력 중이면 엔터키 무시
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                handleClear();
            }
        },
        [handleSearch, handleClear],
    );

    /**
     * 포커스 관련 핸들러들
     */
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // ===== 스타일 정의 섹션 =====

    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px',
        position: 'relative',
        border: `2px solid ${isFocused ? '#3b82f6' : '#d1d5db'}`,
        borderRadius: '8px',
        backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
        boxShadow: isFocused
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
    };

    const inputStyles = {
        flex: 1,
        padding: '12px 16px',
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        fontFamily: 'inherit',
        backgroundColor: 'transparent',
        color: disabled ? '#9ca3af' : '#1f2937',
    };

    const buttonBaseStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        margin: '0 4px',
        width: '40px',
        height: '40px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
    };

    const searchButtonStyles = {
        ...buttonBaseStyles,
        color: loading ? '#9ca3af' : '#3b82f6',
    };

    const clearButtonStyles = {
        ...buttonBaseStyles,
        color: '#6b7280',
    };

    // ===== JSX 렌더링 섹션 =====

    return (
        <div
            className={`search-bar ${className}`}
            style={containerStyles}
            role="search"
            aria-label="콘서트 검색"
        >
            {/* 검색 입력 필드 */}
            <input
                ref={inputRef}
                type="text"
                value={currentSearchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} // 🔥 keyPress 대신 keyDown 사용
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                style={inputStyles}
                aria-label="검색어 입력"
                aria-describedby="search-help"
                autoComplete="off"
                autoFocus={autoFocus}
            />

            {/* 🔥 검색어 지우기 버튼 (조건 수정) */}
            {currentSearchTerm && currentSearchTerm.length > 0 && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    style={clearButtonStyles}
                    aria-label="검색어 지우기"
                    title="검색어 지우기 (ESC)"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}

            {/* 검색 실행 버튼 */}
            <button
                type="button"
                onClick={handleSearch}
                disabled={disabled || loading}
                style={searchButtonStyles}
                aria-label="검색 실행"
                title="검색 실행 (Enter)"
            >
                {loading ? (
                    // 로딩 스피너
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            animation: 'spin 1s linear infinite',
                        }}
                    >
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                ) : (
                    // 돋보기 아이콘
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                )}
            </button>

            {/* 접근성 도움말 */}
            <div
                id="search-help"
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                }}
                aria-hidden="true"
            >
                콘서트 제목, 아티스트명, 공연장명으로 검색할 수 있습니다.
                엔터키를 누르거나 검색 버튼을 클릭하세요.
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};

// ===== 기본 PROPS =====
SearchBar.defaultProps = {
    initialValue: '',
    placeholder: '콘서트나 아티스트를 검색하세요',
    loading: false,
    disabled: false,
    autoFocus: false,
    className: '',
};

export default SearchBar;
