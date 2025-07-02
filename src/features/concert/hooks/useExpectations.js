// src/features/concert/hooks/useExpectations.js

// React에서 제공하는 기본 훅들을 import
// useState: 컴포넌트의 상태(데이터)를 관리하는 훅
// useEffect: 컴포넌트가 렌더링된 후 특정 작업을 수행하는 훅 (API 호출 등)
// useCallback: 함수를 메모이제이션(캐싱)해서 불필요한 재생성을 방지하는 훅
import { useState, useEffect, useCallback } from 'react';

// 우리가 만든 기대평 서비스 import (실제 API 호출 로직이 들어있음)
import { expectationService } from '../services/expectationService.js';

// 기대평 관련 타입과 기본값들 import
import { ExpectationDefaults } from '../types/expectation.js';

/**
 * 기대평(Expectation Review) 목록 관리를 위한 커스텀 React 훅
 *
 * 🎯 이 훅이 하는 일:
 * 1. 특정 콘서트의 기대평 목록 상태 관리 (expectations 배열)
 * 2. API 호출 중인지 상태 관리 (loading boolean)
 * 3. 에러 발생 시 에러 상태 관리 (error 객체/메시지)
 * 4. 페이지네이션 상태 관리 (page, totalPages 등)
 * 5. 기대평 목록을 가져오는 함수 제공 (fetchExpectations)
 * 6. 기대평 작성/수정/삭제 함수 제공
 * 7. 페이지 변경 함수 제공
 *
 * 🔄 사용 방법:
 * const { expectations, loading, error, fetchExpectations, createExpectation } = useExpectations(concertId);
 *
 * 💡 기대평 vs 리뷰 차이점:
 * - 기대평: 콘서트 관람 **전**에 작성하는 기대감 (1-5점 기대점수)
 * - 리뷰: 콘서트 관람 **후**에 작성하는 실제 후기 (1-5점 평점)
 *
 * @param {number} concertId - 기대평을 관리할 콘서트 ID (필수)
 * @returns {Object} 기대평 관련 상태와 함수들이 담긴 객체
 */
export const useExpectations = (concertId) => {
    // ===== 상태(State) 정의 =====
    // React의 useState 훅을 사용해서 컴포넌트의 상태를 정의

    // 기대평 목록 데이터를 저장하는 상태
    // 초기값: 빈 배열 []
    const [expectations, setExpectations] = useState([]);

    // API 호출 중인지 여부를 나타내는 상태
    // 초기값: false (로딩 중이 아님)
    const [loading, setLoading] = useState(false);

    // 에러 발생 시 에러 정보를 저장하는 상태
    // 초기값: null (에러 없음)
    const [error, setError] = useState(null);

    // 페이지네이션 관련 상태들
    // 현재 페이지 번호 (0부터 시작)
    const [currentPage, setCurrentPage] = useState(0);

    // 한 페이지당 보여줄 기대평 개수 (기본값: 10개)
    const [pageSize, setPageSize] = useState(ExpectationDefaults.pageSize);

    // 전체 페이지 수 (API에서 받아옴)
    const [totalPages, setTotalPages] = useState(0);

    // 전체 기대평 개수 (API에서 받아옴)
    const [totalElements, setTotalElements] = useState(0);

    // 개별 기대평 작업 상태 (작성/수정/삭제 중인지)
    const [actionLoading, setActionLoading] = useState(false);

    // ===== 함수 정의 =====

    /**
     * 기대평 목록을 가져오는 함수
     * useCallback으로 감싸서 불필요한 함수 재생성을 방지
     *
     * @param {Object} params - 조회 파라미터 (선택사항)
     * @param {number} params.page - 가져올 페이지 번호 (기본값: currentPage)
     * @param {number} params.size - 페이지 크기 (기본값: pageSize)
     */
    const fetchExpectations = useCallback(
        async (params = {}) => {
            try {
                // concertId가 없으면 기대평을 조회할 수 없음
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                // 로딩 시작: 사용자에게 "데이터 가져오는 중"임을 표시
                setLoading(true);

                // 이전 에러 상태 초기화: 새로운 요청이므로 기존 에러 제거
                setError(null);

                // 파라미터 기본값 설정 및 현재 상태와 병합
                const requestParams = {
                    concertId, // 콘서트 ID (필수)
                    page: params.page ?? currentPage, // 페이지 번호 (기본값: 현재 페이지)
                    size: params.size ?? pageSize, // 페이지 크기 (기본값: 현재 페이지 크기)
                };

                // 실제 API 호출: expectationService의 getConcertExpectations 메서드 사용
                // 백엔드에서 페이지네이션된 기대평 데이터를 받아옴
                const response =
                    await expectationService.getConcertExpectations(
                        requestParams,
                    );

                // API 호출 성공 시 받아온 데이터로 상태 업데이트
                if (response && response.data) {
                    // 기대평 목록 데이터 설정
                    setExpectations(response.data.content || []);

                    // 페이지네이션 정보 업데이트
                    setCurrentPage(response.data.number || 0); // 현재 페이지
                    setTotalPages(response.data.totalPages || 0); // 전체 페이지 수
                    setTotalElements(response.data.totalElements || 0); // 전체 기대평 수
                    setPageSize(
                        response.data.size || ExpectationDefaults.pageSize,
                    ); // 페이지 크기

                    // 개발/디버깅용 로그: 몇 개의 기대평을 받았는지 확인
                    console.info(
                        `기대평 목록 로드 완료: ${response.data.content?.length || 0}개 (콘서트 ID: ${concertId})`,
                    );
                } else {
                    // API 응답은 성공했지만 데이터 형식이 예상과 다른 경우
                    setExpectations([]);
                    setError('기대평 데이터를 불러올 수 없습니다.');
                }
            } catch (err) {
                // API 호출 실패 시 에러 처리
                console.error(
                    `기대평 목록 조회 실패 (콘서트 ID: ${concertId}):`,
                    err,
                );

                // 사용자에게 보여줄 친화적인 에러 메시지 설정
                setError(
                    err.message ||
                        '기대평 목록을 불러오는 중 오류가 발생했습니다.',
                );

                // 에러 발생 시 빈 배열로 초기화
                setExpectations([]);
            } finally {
                // 성공/실패 상관없이 로딩 상태 해제
                setLoading(false);
            }
        },
        [concertId, currentPage, pageSize],
    ); // 이 값들이 변경되면 함수 재생성

    /**
     * 새로운 기대평을 작성하는 함수
     *
     * @param {import('../types/expectation.js').ExpectationFormData} expectationData - 작성할 기대평 데이터
     * @returns {Promise<import('../types/expectation.js').ExpectationReview>} 생성된 기대평 정보
     */
    const createExpectation = useCallback(
        async (expectationData) => {
            try {
                // concertId 유효성 검증
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                // 개별 작업 로딩 시작 (기대평 목록 로딩과 구분)
                setActionLoading(true);

                // 에러 상태 초기화
                setError(null);

                // 실제 API 호출: expectationService의 createExpectation 메서드 사용
                const response = await expectationService.createExpectation(
                    concertId,
                    expectationData,
                );

                // 기대평 작성 성공 시 목록 새로고침
                // 첫 페이지로 이동해서 방금 작성한 기대평을 보여줌 (최신순 정렬이므로)
                await fetchExpectations({ page: 0 });

                // 성공 로그
                console.info(
                    `기대평 작성 완료: 기대점수 ${expectationData.expectationRating}점 (콘서트 ID: ${concertId})`,
                );

                // 생성된 기대평 정보 반환 (컴포넌트에서 추가 처리 가능)
                return response.data;
            } catch (err) {
                console.error(
                    `기대평 작성 실패 (콘서트 ID: ${concertId}):`,
                    err,
                );

                // 에러를 상태에 설정하고 컴포넌트로도 전달
                setError(err.message || '기대평 작성 중 오류가 발생했습니다.');
                throw err; // 컴포넌트에서 에러 처리를 할 수 있도록 다시 throw
            } finally {
                // 개별 작업 로딩 해제
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations],
    ); // concertId와 fetchExpectations가 변경되면 함수 재생성

    /**
     * 기존 기대평을 수정하는 함수
     *
     * @param {number} expectationId - 수정할 기대평 ID
     * @param {import('../types/expectation.js').ExpectationFormData} expectationData - 수정할 데이터
     * @returns {Promise<import('../types/expectation.js').ExpectationReview>} 수정된 기대평 정보
     */
    const updateExpectation = useCallback(
        async (expectationId, expectationData) => {
            try {
                // ID 파라미터 유효성 검증
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!expectationId || expectationId < 1) {
                    throw new Error('유효한 기대평 ID가 필요합니다.');
                }

                // 개별 작업 로딩 시작
                setActionLoading(true);
                setError(null);

                // 실제 API 호출: expectationService의 updateExpectation 메서드 사용
                const response = await expectationService.updateExpectation(
                    concertId,
                    expectationId,
                    expectationData,
                );

                // 기대평 수정 성공 시 현재 페이지 새로고침
                // 페이지 위치는 유지하면서 수정된 내용만 반영
                await fetchExpectations();

                // 성공 로그
                console.info(
                    `기대평 수정 완료: ID ${expectationId} (콘서트 ID: ${concertId})`,
                );

                // 수정된 기대평 정보 반환
                return response.data;
            } catch (err) {
                console.error(
                    `기대평 수정 실패 (기대평 ID: ${expectationId}):`,
                    err,
                );

                // 에러를 상태에 설정하고 컴포넌트로도 전달
                setError(err.message || '기대평 수정 중 오류가 발생했습니다.');
                throw err;
            } finally {
                // 개별 작업 로딩 해제
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations],
    ); // concertId와 fetchExpectations가 변경되면 함수 재생성

    /**
     * 기대평을 삭제하는 함수
     *
     * @param {number} expectationId - 삭제할 기대평 ID
     * @returns {Promise<void>}
     */
    const deleteExpectation = useCallback(
        async (expectationId) => {
            try {
                // ID 파라미터 유효성 검증
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!expectationId || expectationId < 1) {
                    throw new Error('유효한 기대평 ID가 필요합니다.');
                }

                // 개별 작업 로딩 시작
                setActionLoading(true);
                setError(null);

                // 실제 API 호출: expectationService의 deleteExpectation 메서드 사용
                await expectationService.deleteExpectation(
                    concertId,
                    expectationId,
                );

                // 기대평 삭제 성공 시 목록 새로고침
                // 현재 페이지에 기대평이 없으면 이전 페이지로 이동
                const currentExpectationCount = expectations.length;
                if (currentExpectationCount === 1 && currentPage > 0) {
                    // 현재 페이지의 마지막 기대평을 삭제한 경우 이전 페이지로 이동
                    await fetchExpectations({ page: currentPage - 1 });
                } else {
                    // 현재 페이지에 다른 기대평이 있으면 현재 페이지 새로고침
                    await fetchExpectations();
                }

                // 성공 로그
                console.info(
                    `기대평 삭제 완료: ID ${expectationId} (콘서트 ID: ${concertId})`,
                );
            } catch (err) {
                console.error(
                    `기대평 삭제 실패 (기대평 ID: ${expectationId}):`,
                    err,
                );

                // 에러를 상태에 설정하고 컴포넌트로도 전달
                setError(err.message || '기대평 삭제 중 오류가 발생했습니다.');
                throw err;
            } finally {
                // 개별 작업 로딩 해제
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations, expectations.length, currentPage],
    ); // 의존하는 상태들

    /**
     * 페이지를 변경하는 함수
     *
     * @param {number} newPage - 이동할 페이지 번호
     */
    const goToPage = useCallback(
        async (newPage) => {
            // 페이지 번호 유효성 검증
            if (newPage < 0 || newPage >= totalPages) {
                console.warn(
                    `유효하지 않은 페이지 번호: ${newPage} (범위: 0-${totalPages - 1})`,
                );
                return;
            }

            // 현재 페이지와 같으면 불필요한 API 호출 방지
            if (newPage === currentPage) {
                console.info('같은 페이지이므로 API 호출을 건너뜁니다.');
                return;
            }

            // 새로운 페이지의 기대평 목록 가져오기
            await fetchExpectations({ page: newPage });
        },
        [fetchExpectations, totalPages, currentPage],
    ); // 이 값들이 변경되면 함수 재생성

    /**
     * 페이지 크기를 변경하는 함수
     *
     * @param {number} newSize - 새로운 페이지 크기 (1-100)
     */
    const changePageSize = useCallback(
        async (newSize) => {
            // 페이지 크기 유효성 검증
            if (newSize < 1 || newSize > 100) {
                console.warn(
                    `유효하지 않은 페이지 크기: ${newSize} (범위: 1-100)`,
                );
                return;
            }

            // 현재 페이지 크기와 같으면 불필요한 API 호출 방지
            if (newSize === pageSize) {
                console.info('같은 페이지 크기이므로 API 호출을 건너뜁니다.');
                return;
            }

            // 페이지 크기 변경 시 첫 페이지부터 다시 조회
            await fetchExpectations({
                page: 0, // 첫 페이지로 이동
                size: newSize, // 새로운 페이지 크기
            });
        },
        [fetchExpectations, pageSize],
    ); // 이 값들이 변경되면 함수 재생성

    /**
     * 특정 기대점수로 기대평을 필터링하는 함수
     * 클라이언트 사이드 필터링 (간단한 필터링이므로 서버 요청 없이 처리)
     *
     * @param {number|null} rating - 필터링할 기대점수 (1-5, null이면 전체)
     * @returns {Array} 필터링된 기대평 목록
     */
    const filterByRating = useCallback(
        (rating) => {
            // rating이 null이면 전체 기대평 반환
            if (rating === null || rating === undefined) {
                return expectations;
            }

            // 특정 기대점수로 필터링
            return expectations.filter(
                (expectation) => expectation.expectationRating === rating,
            );
        },
        [expectations],
    ); // expectations가 변경되면 함수 재생성

    // ===== 부수 효과(Side Effect) =====

    /**
     * concertId가 변경될 때마다 자동으로 기대평 목록을 가져오는 효과
     * 새로운 콘서트 페이지로 이동했을 때 해당 콘서트의 기대평을 자동으로 로드
     */
    useEffect(() => {
        // concertId가 유효한 값일 때만 API 호출
        if (concertId && concertId > 0) {
            // 새로운 콘서트의 기대평 목록을 첫 페이지부터 기본 설정으로 가져오기
            fetchExpectations({
                page: 0, // 첫 페이지
                size: ExpectationDefaults.pageSize, // 기본 페이지 크기
            });

            // 개발자를 위한 로그: 어떤 콘서트의 기대평을 가져오는지 확인
            console.info(
                `콘서트 ID ${concertId}의 기대평 목록을 자동 로드합니다.`,
            );
        }
    }, [concertId, fetchExpectations]); // concertId나 fetchExpectations가 변경되면 다시 실행

    // ===== 반환값 =====

    /**
     * 이 훅을 사용하는 컴포넌트에게 제공할 상태와 함수들
     * 컴포넌트에서 구조 분해 할당으로 필요한 것만 가져다 쓸 수 있음
     */
    return {
        // 📊 데이터 상태
        expectations, // 현재 로드된 기대평 목록 배열
        loading, // 기대평 목록 로딩 중인지 여부 (true/false)
        actionLoading, // 개별 작업 (작성/수정/삭제) 중인지 여부
        error, // 에러 메시지 (문자열 또는 null)

        // 📄 페이지네이션 상태
        currentPage, // 현재 페이지 번호
        totalPages, // 전체 페이지 수
        totalElements, // 전체 기대평 개수
        pageSize, // 한 페이지당 기대평 수

        // 🔧 액션 함수들 (컴포넌트에서 호출해서 상태 변경)
        fetchExpectations, // 기대평 목록 새로고침
        createExpectation, // 새 기대평 작성
        updateExpectation, // 기존 기대평 수정
        deleteExpectation, // 기대평 삭제
        goToPage, // 특정 페이지로 이동
        changePageSize, // 페이지 크기 변경

        // 🔍 필터링 함수들
        filterByRating, // 기대점수별 필터링

        // 🎛️ 편의 기능들
        refresh: () => fetchExpectations(), // 현재 설정으로 새로고침
        hasNextPage: currentPage < totalPages - 1, // 다음 페이지 있는지 여부
        hasPrevPage: currentPage > 0, // 이전 페이지 있는지 여부
        isEmpty: expectations.length === 0 && !loading, // 기대평이 비어있는지 (로딩 중이 아닐 때)
        isFirstPage: currentPage === 0, // 첫 페이지인지 여부
        isLastPage: currentPage === totalPages - 1, // 마지막 페이지인지 여부

        // 기대평 관련 편의 속성들
        hasExpectations: expectations.length > 0, // 기대평이 있는지 여부
    };
};
