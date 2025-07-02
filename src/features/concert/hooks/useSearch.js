// src/features/concert/hooks/useSearch.js

import { useState, useCallback, useRef, useEffect } from 'react';
import { concertService } from '../services/concertService.js';

/**
 * 콘서트 검색 기능을 관리하는 커스텀 React 훅 (디바운스 문제 해결 버전)
 *
 * 🔥 주요 수정사항:
 * 1. 디바운스 타이머 제거 (즉시 검색으로 변경)
 * 2. 검색 로직 단순화
 * 3. 성능 최적화 유지
 */
export const useSearch = () => {
    // ===== 상태(State) 정의 =====
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // 검색 취소를 위한 AbortController 참조
    const abortControllerRef = useRef(null);

    // ===== 함수 정의 =====

    /**
     * 🔥 검색을 수행하는 함수 (디바운스 제거, 즉시 실행)
     */
    const performSearch = useCallback(
        async (keyword = searchTerm) => {
            try {
                // 이전 요청이 있으면 취소
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // 새로운 AbortController 생성
                abortControllerRef.current = new AbortController();

                // 키워드 검증
                const trimmedKeyword = keyword.trim();
                if (!trimmedKeyword) {
                    setSearchResults([]);
                    setSearchError(null);
                    return;
                }

                // 검색 시작
                setIsSearching(true);
                setSearchError(null);

                console.log(`검색 시작: "${trimmedKeyword}"`);

                // 실제 API 호출
                const response =
                    await concertService.searchConcerts(trimmedKeyword);

                // 요청이 취소되었는지 확인
                if (abortControllerRef.current.signal.aborted) {
                    console.log('검색 요청이 취소됨');
                    return;
                }

                // 검색 성공 시 결과 처리
                if (response && response.data) {
                    const results = response.data;
                    setSearchResults(results);
                    console.info(
                        `검색 완료: "${trimmedKeyword}" → ${results.length}개 결과`,
                    );
                } else {
                    setSearchResults([]);
                    setSearchError('검색 결과를 불러올 수 없습니다.');
                }
            } catch (error) {
                // AbortError는 정상적인 취소이므로 무시
                if (error.name === 'AbortError') {
                    console.log('검색 요청 취소됨');
                    return;
                }

                console.error(`검색 실패: "${keyword}":`, error);
                setSearchError(error.message || '검색 중 오류가 발생했습니다.');
                setSearchResults([]);
            } finally {
                // 성공/실패 상관없이 로딩 상태 해제
                setIsSearching(false);
            }
        },
        [searchTerm],
    );

    /**
     * 🔥 검색 상태를 모두 초기화하는 함수
     */
    const clearSearch = useCallback(() => {
        // 진행 중인 검색 요청 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 모든 상태 초기화
        setSearchTerm('');
        setSearchResults([]);
        setSearchError(null);
        setIsSearching(false);

        console.info('검색 상태가 초기화되었습니다.');
    }, []);

    /**
     * 검색어만 초기화하는 함수 (검색 결과는 유지)
     */
    const clearSearchTerm = useCallback(() => {
        setSearchTerm('');
    }, []);

    /**
     * 검색 결과만 초기화하는 함수 (검색어는 유지)
     */
    const clearSearchResults = useCallback(() => {
        // 진행 중인 검색 요청 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setSearchResults([]);
        setSearchError(null);
        setIsSearching(false);
    }, []);

    // ===== 컴포넌트 언마운트 시 정리 =====
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 진행 중인 요청 취소
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // ===== 반환값 =====
    return {
        // 📊 검색 상태
        searchTerm,
        searchResults,
        isSearching,
        searchError,

        // 🔧 액션 함수들
        setSearchTerm,
        performSearch,
        clearSearch,
        clearSearchTerm,
        clearSearchResults,

        // 🎛️ 편의 기능들
        hasResults: searchResults.length > 0,
        hasError: !!searchError,
        isEmpty: searchResults.length === 0 && !isSearching,

        // 검색 관련 편의 속성들
        resultCount: searchResults.length,
        isEmptySearch: !searchTerm.trim(),
        canSearch: searchTerm.trim().length > 0 && !isSearching,
    };
};
